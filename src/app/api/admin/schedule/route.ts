import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const clinicSlug = process.env.CLINIC_SLUG || "tingey-dental";

  const { data, error } = await supabase
    .from("clinic_settings")
    .select("schedule_config")
    .eq("clinic_slug", clinicSlug)
    .single();

  if (error) {
    console.error("Schedule fetch error:", error);
    return Response.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }

  const defaultSchedule = {
    startHour: 8,
    endHour: 17,
    slotDuration: 30,
    workingDays: [1, 2, 3, 4],
    fridayByAppointment: true,
  };

  return Response.json({ schedule: data?.schedule_config || defaultSchedule });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const clinicSlug = process.env.CLINIC_SLUG || "tingey-dental";

    const { error } = await supabase
      .from("clinic_settings")
      .update({ schedule_config: body })
      .eq("clinic_slug", clinicSlug);

    if (error) {
      console.error("Schedule update error:", error);
      return Response.json({ error: "Failed to update schedule" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
