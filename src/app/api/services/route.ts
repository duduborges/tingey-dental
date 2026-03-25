import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const clinicSlug = process.env.CLINIC_SLUG || "tingey-dental";

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("clinic_slug", clinicSlug)
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("Services fetch error:", error);
    return Response.json({ error: "Failed to fetch services" }, { status: 500 });
  }

  return Response.json({ services: data || [] });
}
