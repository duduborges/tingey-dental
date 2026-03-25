import { supabase, getClinicId } from "@/app/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  const clinicId = await getClinicId();
  if (!clinicId) {
    return Response.json({ error: "Clinic not found" }, { status: 404 });
  }

  let query = supabase
    .from("appointments")
    .select("*, services(name)")
    .eq("clinic_id", clinicId)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (dateFrom) {
    query = query.gte("appointment_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("appointment_date", dateTo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Appointments fetch error:", error);
    return Response.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }

  return Response.json({ appointments: data || [] });
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return Response.json({ error: "id and status are required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Appointment update error:", error);
      return Response.json({ error: "Failed to update appointment" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
