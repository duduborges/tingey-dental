import { supabase, getClinicId, getClinic } from "@/app/lib/supabase";

export async function GET() {
  const clinicId = await getClinicId();
  if (!clinicId) {
    return Response.json({ error: "Clinic not found" }, { status: 404 });
  }

  /* ---- Get available_slots for each day ---- */
  const { data: slots } = await supabase
    .from("available_slots")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("day_of_week");

  /* ---- Get blocked dates ---- */
  const { data: blockedDates } = await supabase
    .from("blocked_dates")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("blocked_date");

  /* ---- Get booking range from clinics table ---- */
  const clinic = await getClinic();

  const workingDays = (slots || []).map((s) => s.day_of_week);
  const firstSlot = slots && slots.length > 0 ? slots[0] : null;

  return Response.json({
    schedule: {
      workingDays,
      startTime: firstSlot?.start_time || "09:00",
      endTime: firstSlot?.end_time || "17:00",
      slotDuration: firstSlot?.slot_duration_minutes || 30,
      bookingRangeDays: clinic?.booking_range_days || 14,
      blockedDates: (blockedDates || []).map((bd) => ({
        id: bd.id,
        date: bd.blocked_date,
        reason: bd.reason,
      })),
    },
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    const { workingDays, startTime, endTime, slotDuration, bookingRangeDays, blockedDates } = body;

    /* ---- Update booking range on clinics table ---- */
    if (bookingRangeDays !== undefined) {
      await supabase
        .from("clinics")
        .update({ booking_range_days: bookingRangeDays })
        .eq("id", clinicId);
    }

    /* ---- Update available_slots: delete all, re-insert ---- */
    if (workingDays) {
      await supabase.from("available_slots").delete().eq("clinic_id", clinicId);

      const slotsToInsert = workingDays.map((day: number) => ({
        clinic_id: clinicId,
        day_of_week: day,
        start_time: startTime || "09:00",
        end_time: endTime || "17:00",
        slot_duration_minutes: slotDuration || 30,
      }));

      const { error: slotsError } = await supabase
        .from("available_slots")
        .insert(slotsToInsert);

      if (slotsError) {
        console.error("Slots update error:", slotsError);
        return Response.json({ error: "Failed to update slots" }, { status: 500 });
      }
    }

    /* ---- Sync blocked dates ---- */
    if (blockedDates !== undefined) {
      await supabase.from("blocked_dates").delete().eq("clinic_id", clinicId);

      if (blockedDates.length > 0) {
        const datesToInsert = blockedDates.map((bd: { date: string; reason: string }) => ({
          clinic_id: clinicId,
          blocked_date: bd.date,
          reason: bd.reason || null,
        }));

        await supabase.from("blocked_dates").insert(datesToInsert);
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Schedule update error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
