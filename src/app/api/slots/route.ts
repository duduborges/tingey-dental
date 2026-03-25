import { supabase, getClinicId, getClinic } from "@/app/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return Response.json({ error: "date is required" }, { status: 400 });
  }

  const clinicId = await getClinicId();
  if (!clinicId) {
    return Response.json({ error: "Clinic not found" }, { status: 404 });
  }

  const clinic = await getClinic();
  const bookingRange = clinic?.booking_range_days || 14;

  /* ---- Check if date is within booking range ---- */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date + "T12:00:00");
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + bookingRange);
  if (selectedDate > maxDate) {
    return Response.json({ slots: [] });
  }

  /* ---- Check blocked dates ---- */
  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("blocked_date", date)
    .limit(1);

  if (blocked && blocked.length > 0) {
    return Response.json({ slots: [] });
  }

  /* ---- Get day of week (0=Sun, 1=Mon, ..., 6=Sat) ---- */
  const dayOfWeek = selectedDate.getDay();

  /* ---- Fetch available_slots config for this day ---- */
  const { data: slotConfig } = await supabase
    .from("available_slots")
    .select("*")
    .eq("clinic_id", clinicId)
    .eq("day_of_week", dayOfWeek)
    .single();

  if (!slotConfig) {
    return Response.json({ slots: [] });
  }

  /* ---- Generate all possible slots from config ---- */
  const startParts = slotConfig.start_time.split(":");
  const endParts = slotConfig.end_time.split(":");
  const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
  const duration = slotConfig.slot_duration_minutes || 30;

  const allSlots: string[] = [];
  for (let m = startMinutes; m < endMinutes; m += duration) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h >= 12 ? "PM" : "AM";
    allSlots.push(`${hour12}:${min.toString().padStart(2, "0")} ${ampm}`);
  }

  /* ---- Fetch booked appointments for this date ---- */
  const { data: booked } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("clinic_id", clinicId)
    .eq("appointment_date", date)
    .in("status", ["pending", "confirmed"]);

  const bookedTimes = new Set(
    (booked || []).map((a) => {
      // appointment_time is stored as HH:MM:SS, convert to display format
      const parts = a.appointment_time.split(":");
      const h = parseInt(parts[0]);
      const min = parts[1];
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      return `${hour12}:${min} ${ampm}`;
    })
  );

  const available = allSlots.filter((s) => !bookedTimes.has(s));

  return Response.json({ slots: available });
}
