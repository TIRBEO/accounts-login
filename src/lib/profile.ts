import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface ProfileData {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatarUrl?: string;
}

export function getProfileFromUser(user: User): ProfileData {
  return {
    displayName: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "User",
    bio: user.user_metadata?.bio ?? "",
    location: user.user_metadata?.location ?? "",
    website: user.user_metadata?.website ?? "",
    avatarUrl: user.user_metadata?.avatar_url,
  };
}

export async function updateProfile(data: Partial<ProfileData>): Promise<void> {
  const metadata: Record<string, string | undefined> = {};
  if (data.displayName !== undefined) metadata.display_name = data.displayName;
  if (data.bio !== undefined) metadata.bio = data.bio;
  if (data.location !== undefined) metadata.location = data.location;
  if (data.website !== undefined) metadata.website = data.website;
  if (data.avatarUrl !== undefined) metadata.avatar_url = data.avatarUrl;

  const { error } = await supabase.auth.updateUser({ data: metadata });
  if (error) throw error;
}
