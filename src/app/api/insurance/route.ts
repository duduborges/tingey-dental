import { supabase, getClinic } from "@/app/lib/supabase";

export async function GET() {
  const clinic = await getClinic();
  if (!clinic) {
    return Response.json({ error: "Clinic not found" }, { status: 404 });
  }

  const plans: string[] = clinic.insurance_plans || [];
  return Response.json({ plans });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { insurance_plans } = body;

    const clinic = await getClinic();
    if (!clinic) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("clinics")
      .update({ insurance_plans })
      .eq("id", clinic.id);

    if (error) {
      console.error("Insurance update error:", error);
      return Response.json({ error: "Failed to update insurance plans" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
