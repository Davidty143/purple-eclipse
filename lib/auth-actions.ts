"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClientForServer } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClientForServer();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClientForServer();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
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

  // Redirect URL for updating the password page after user clicks the reset link
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl, // Make sure this URL points to the correct route
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

// Refactor to accept state and formData
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

export { updatePassword, sendResetPasswordEmail };
