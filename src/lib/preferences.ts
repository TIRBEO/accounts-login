import { supabase } from "@/lib/supabase";

export interface UserPreferences {
  theme: "dark" | "light" | "system";
  language: string;
  email_security: boolean;
  email_updates: boolean;
  email_community: boolean;
  email_marketing: boolean;
}

const defaults: UserPreferences = {
  theme: "dark",
  language: "en",
  email_security: true,
  email_updates: true,
  email_community: true,
  email_marketing: false,
};

export async function getPreferences(): Promise<UserPreferences> {
  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .maybeSingle();
  return (data as UserPreferences) ?? defaults;
}

export async function updatePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  await supabase.from("user_preferences").upsert(
    { user_id: authData.user.id, ...prefs, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
}
