import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Shield,
  Bell,
  Palette,
  Key,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "api-keys", label: "API Keys", icon: Key },
];

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().max(500, "Bio must be 500 characters or less"),
  location: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get("tab") || "profile";
  const [saveLoading, setSaveLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "John Doe",
      bio: "Full-stack developer & community builder",
      location: "San Francisco",
      website: "https://johndoe.com",
    },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async () => {
    setSaveLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaveLoading(false);
  };

  const onPasswordSubmit = async () => {
    setSaveLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaveLoading(false);
    passwordForm.reset();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Account Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage your Tirbeo Identity account</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <nav className="flex shrink-0 flex-col gap-1 lg:w-52">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <Link
                key={t.id}
                to={`/settings?tab=${t.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-ink-soft hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1">
          {tab === "profile" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold">Profile Information</h2>
                <p className="text-sm text-ink-soft">Update your public profile details</p>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="mt-4 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-xl font-semibold text-foreground">
                      JD
                    </div>
                    <div>
                      <Button variant="outline" size="sm" type="button">
                        Change Avatar
                      </Button>
                      <p className="mt-1 text-xs text-ink-soft">PNG, JPG. Max 2MB.</p>
                    </div>
                  </div>
                  <Input
                    label="Display Name"
                    error={profileForm.formState.errors.displayName?.message}
                    {...profileForm.register("displayName")}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                      Bio
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground placeholder:text-ink-soft/50 outline-none transition-colors focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
                      rows={3}
                      placeholder="Tell us about yourself"
                      {...profileForm.register("bio")}
                    />
                    {profileForm.formState.errors.bio && (
                      <p className="mt-1 text-xs text-destructive">
                        {profileForm.formState.errors.bio.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Location"
                      placeholder="City, Country"
                      {...profileForm.register("location")}
                    />
                    <Input
                      label="Website"
                      placeholder="https://yoursite.com"
                      error={profileForm.formState.errors.website?.message}
                      {...profileForm.register("website")}
                    />
                  </div>
                  <Button type="submit" loading={saveLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </form>
              </section>

              <hr className="border-border" />

              <section>
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p className="text-sm text-ink-soft">Update your account password</p>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="mt-4 space-y-4 max-w-sm"
                >
                  <div className="relative">
                    <Input
                      label="Current Password"
                      type={showCurrent ? "text" : "password"}
                      error={passwordForm.formState.errors.currentPassword?.message}
                      {...passwordForm.register("currentPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-[38px] text-ink-soft hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showNew ? "text" : "password"}
                      error={passwordForm.formState.errors.newPassword?.message}
                      {...passwordForm.register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-[38px] text-ink-soft hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      label="Confirm New Password"
                      type={showConfirm ? "text" : "password"}
                      error={passwordForm.formState.errors.confirmPassword?.message}
                      {...passwordForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-[38px] text-ink-soft hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button type="submit" loading={saveLoading} variant="secondary">
                    Update Password
                  </Button>
                </form>
              </section>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
                <p className="text-sm text-ink-soft">Add an extra layer of security to your account</p>
                <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Authenticator App (TOTP)</h3>
                      <p className="mt-1 text-sm text-ink-soft">
                        Use Google Authenticator, Authy, or similar
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-border bg-secondary/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">SMS Codes</h3>
                      <p className="mt-1 text-sm text-ink-soft">
                        Receive codes via text message
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Set Up
                    </Button>
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              <section>
                <h2 className="text-lg font-semibold">Active Sessions</h2>
                <p className="text-sm text-ink-soft">
                  Devices and browsers currently logged in to your account
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      device: "Chrome on Windows",
                      location: "San Francisco, US",
                      lastActive: "Active now",
                      current: true,
                    },
                    {
                      device: "Safari on iPhone",
                      location: "San Francisco, US",
                      lastActive: "2 hours ago",
                      current: false,
                    },
                    {
                      device: "Firefox on macOS",
                      location: "New York, US",
                      lastActive: "3 days ago",
                      current: false,
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/10 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                          {s.current ? (
                            <Shield className="h-4 w-4 text-green-500" />
                          ) : (
                            <User className="h-4 w-4 text-ink-soft" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {s.device}
                            {s.current && (
                              <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {s.location} &middot; {s.lastActive}
                          </p>
                        </div>
                      </div>
                      {!s.current && (
                        <button
                          type="button"
                          className="text-xs text-ink-soft underline-offset-2 hover:text-destructive hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="ghost" size="sm">
                    Revoke All Other Sessions
                  </Button>
                </div>
              </section>
            </div>
          )}

          {tab === "notifications" && (
            <section>
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Choose what updates you receive via email
              </p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    label: "Security alerts",
                    desc: "New sign-ins, password changes, and security events",
                  },
                  {
                    label: "Product updates",
                    desc: "New features and improvements to Tirbeo services",
                  },
                  {
                    label: "Community activity",
                    desc: "Messages, mentions, and replies",
                  },
                  {
                    label: "Marketing emails",
                    desc: "Tips, guides, and offers",
                  },
                ].map((n, i) => (
                  <label
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-ink-soft">{n.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-border bg-secondary text-foreground accent-foreground"
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          {tab === "appearance" && (
            <section>
              <h2 className="text-lg font-semibold">Appearance</h2>
              <p className="mt-1 text-sm text-ink-soft">Customize your theme preferences</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-border bg-secondary/10 p-4">
                  <p className="text-sm font-medium">Theme</p>
                  <div className="mt-3 flex gap-3">
                    {["Dark", "Light", "System"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary"
                      >
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            t === "Dark"
                              ? "border-foreground bg-black"
                              : t === "Light"
                                ? "border-foreground bg-white"
                                : "border-foreground bg-gradient-to-br from-black to-white"
                          }`}
                        />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {tab === "api-keys" && (
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">API Keys</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Manage keys for programmatic access to Tirbeo APIs
                  </p>
                </div>
                <Button size="sm">Create Key</Button>
              </div>
              <div className="mt-6 rounded-xl border border-border bg-secondary/10 p-8 text-center">
                <Key className="mx-auto h-8 w-8 text-ink-soft" />
                <p className="mt-2 text-sm text-ink-soft">No API keys created yet</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
