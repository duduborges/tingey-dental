import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const clinicSlug = process.env.CLINIC_SLUG || "tingey-dental";

  const { data, error } = await supabase
    .from("insurance_plans")
    .select("*")
    .eq("clinic_slug", clinicSlug)
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("Insurance fetch error:", error);
    return Response.json({ error: "Failed to fetch insurance plans" }, { status: 500 });
  }

  return Response.json({ plans: data || [] });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, active } = body;

    const { error } = await supabase
      .from("insurance_plans")
      .update({ active })
      .eq("id", id);

    if (error) {
      return Response.json({ error: "Failed to update insurance plan" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
