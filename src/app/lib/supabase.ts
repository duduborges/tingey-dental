import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getClinicId(): Promise<string | null> {
  const slug = process.env.CLINIC_SLUG || "tingey-dental";
  const { data } = await supabase
    .from("clinics")
    .select("id")
    .eq("slug", slug)
    .single();
  return data?.id || null;
}

export async function getClinic() {
  const slug = process.env.CLINIC_SLUG || "tingey-dental";
  const { data } = await supabase
    .from("clinics")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}
