"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function getRequiredString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function signup(formData: FormData) {
  const fullName = getRequiredString(formData, "fullName");
  const businessName = getRequiredString(formData, "businessName");
  const email = getRequiredString(formData, "email").toLowerCase();
  const password = getRequiredString(formData, "password");

  if (!fullName || !businessName || !email || !password) {
    redirect("/signup?error=missing-fields");
  }

  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      business_name: businessName,
    },
  });

  if (authError || !authData.user) {
    redirect("/signup?error=signup-failed");
  }

  const authUserId = authData.user.id;

  const { data: businessData, error: businessError } = await admin
    .from("businesses")
    .insert({
      name: businessName,
      email,
    })
    .select("id")
    .single();
  const business = businessData as { id: string } | null;

  if (businessError || !business) {
    await admin.auth.admin.deleteUser(authUserId);
    redirect("/signup?error=setup-failed");
  }

  const { data: appUserData, error: userError } = await admin
    .from("users")
    .insert({
      auth_user_id: authUserId,
      business_id: business.id,
      email,
      name: fullName,
      role: "owner",
      status: "active",
    })
    .select("id")
    .single();
  const appUser = appUserData as { id: string } | null;

  if (userError || !appUser) {
    await admin.from("businesses").delete().eq("id", business.id);
    await admin.auth.admin.deleteUser(authUserId);
    redirect("/signup?error=setup-failed");
  }

  await admin.from("audit_logs").insert([
    {
      business_id: business.id,
      user_id: appUser.id,
      entity_type: "business",
      entity_id: business.id,
      action: "business.created",
      details: {
        name: businessName,
      },
    },
    {
      business_id: business.id,
      user_id: appUser.id,
      entity_type: "user",
      entity_id: appUser.id,
      action: "user.created",
      details: {
        email,
        role: "owner",
      },
    },
  ]);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect("/login");
  }

  redirect("/dashboard");
}
