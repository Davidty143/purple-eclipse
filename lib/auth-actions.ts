"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClientForServer } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  console.log("Starting login process...");
  const supabase = await createClientForServer();

  try {
    const emailOrUsername = formData.get("emailOrUsername")?.toString().trim();
    const password = formData.get("password")?.toString().trim();
    console.log("Received credentials:", { emailOrUsername, password });

    if (!emailOrUsername) {
      console.error("Validation failed: Missing email/username");
      return { error: "Email or username is required" };
    }
    if (!password) {
      console.error("Validation failed: Missing password");
      return { error: "Password is required" };
    }

    let email = emailOrUsername;

    if (!emailOrUsername.includes("@")) {
      console.log("Username detected, looking up email...");
      const { data: userData, error: userError } = await supabase
        .from("Account")
        .select("account_email")
        .eq("account_username", emailOrUsername)
        .single();

      if (userError || !userData?.account_email) {
        console.error(
          "Username lookup failed:",
          userError?.message || "No email found"
        );
        return { error: "Invalid credentials" };
      }

      email = userData.account_email;
      console.log("Mapped username to email:", email);
    }

    console.log("Attempting login with email:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Authentication failed:", error.message);
      return { error: "Invalid credentials" };
    }

    revalidatePath("/", "layout");
    return { success: true }; // Return success instead of redirect
  } catch (error) {
    console.error("Unexpected login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClientForServer();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    password_confirm: formData.get("password_confirm") as string,
    options: {
      data: {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
      },
    },
  };

  if (formData.get("password") !== formData.get("password_confirm")) {
    throw new Error("Passwords do not match");
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/signup");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signout() {
  const supabase = await createClientForServer();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect("/logout");
}

export async function signInWithGoogle() {
  const supabase = await createClientForServer();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}

const sendResetPasswordEmail = async (formData: FormData) => {
  const supabase = await createClientForServer();
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    return {
      success: "",
      error: "Email is required.",
    };
  }

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.log("error", error);
    return {
      success: "",
      error: error.message,
    };
  }

  return {
    success: "Please check your email to reset your password.",
    error: "",
  };
};

const updatePassword = async (
  state: { error: string; success: string },
  formData: FormData
) => {
  const supabase = await createClientForServer();

  const password = formData.get("password");

  if (password === null || typeof password !== "string") {
    return {
      ...state,
      success: "",
      error: "Password is required",
    };
  }

  const { data, error } = await supabase.auth.updateUser({
    password: password as string, // Casting password to string if not null
  });

  if (error) {
    console.log("error", error);
    return {
      ...state,
      success: "",
      error: error.message,
    };
  }

  return {
    ...state,
    success: "Password updated",
    error: "",
  };
};

export async function updateUsername(formData: FormData) {
  const supabase = await createClientForServer();

  const username = formData.get("username") as string;

  if (!username || username.trim().length === 0) {
    throw new Error("Username cannot be empty.");
  }

  const { data: session, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !session?.user) {
    throw new Error("User not authenticated.");
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      username: username,
    },
  });

  if (error) {
    console.log("Error updating username:", error);
    throw new Error(error.message);
  }

  revalidatePath("/");

  redirect("/");
}

export { updatePassword, sendResetPasswordEmail };
