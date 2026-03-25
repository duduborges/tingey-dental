import { supabase, getClinicId } from "@/app/lib/supabase";

export async function GET() {
  const clinicId = await getClinicId();
  if (!clinicId) {
    return Response.json({ error: "Clinic not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("name");

  if (error) {
    console.error("Services fetch error:", error);
    return Response.json({ error: "Failed to fetch services" }, { status: 500 });
  }

  return Response.json({ services: data || [] });
}
