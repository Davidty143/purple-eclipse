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

export async function updateUsername(formData: FormData) {
  const supabase = await createClientForServer();

  const username = formData.get("username") as string;

  // Ensure the username is not empty
  if (!username || username.trim().length === 0) {
    throw new Error("Username cannot be empty.");
  }

  // Get the current user session
  const { data: session, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !session?.user) {
    throw new Error("User not authenticated.");
  }

  // Update the user's metadata with the new username
  const { error } = await supabase.auth.updateUser({
    data: {
      username: username,
    },
  });

  if (error) {
    console.log("Error updating username:", error);
    throw new Error(error.message);
  }

  // Revalidate the layout path (re-render components if needed)
  revalidatePath("/");

  // Redirect to the profile or home page after successful update
  redirect("/");
}

export { updatePassword, sendResetPasswordEmail };
