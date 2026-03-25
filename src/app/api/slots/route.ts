import { supabase } from "@/app/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const clinicSlug = process.env.CLINIC_SLUG || "tingey-dental";

  if (!date) {
    return Response.json({ error: "date is required" }, { status: 400 });
  }

  /* ---- Fetch clinic schedule config ---- */
  const { data: config } = await supabase
    .from("clinic_settings")
    .select("schedule_config")
    .eq("clinic_slug", clinicSlug)
    .single();

  const schedule = config?.schedule_config || {
    startHour: 8,
    endHour: 17,
    slotDuration: 30,
    workingDays: [1, 2, 3, 4],
    fridayByAppointment: true,
  };

  const dayOfWeek = new Date(date + "T12:00:00").getDay();

  /* ---- Check if the day is a working day ---- */
  const workingDays: number[] = schedule.workingDays || [1, 2, 3, 4];
  if (!workingDays.includes(dayOfWeek) && !(schedule.fridayByAppointment && dayOfWeek === 5)) {
    return Response.json({ slots: [] });
  }

  /* ---- Generate all possible slots ---- */
  const startHour = schedule.startHour || 8;
  const endHour = schedule.endHour || 17;
  const duration = schedule.slotDuration || 30;
  const allSlots: string[] = [];

  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += duration) {
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const timeStr = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
      allSlots.push(timeStr);
    }
  }

  /* ---- Fetch booked appointments for this date ---- */
  const { data: booked } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("clinic_slug", clinicSlug)
    .eq("appointment_date", date)
    .in("status", ["pending", "confirmed"]);

  const bookedTimes = new Set((booked || []).map((a) => a.appointment_time));

  /* ---- Filter out booked slots ---- */
  const available = allSlots.filter((s) => !bookedTimes.has(s));

  return Response.json({ slots: available });
}
