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

  // Validate email to ensure it's a string
  if (email === null || typeof email !== "string") {
    return {
      success: "",
      error: "Email is required.",
    };
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.log("error", error);

    return {
      success: "",
      error: error.message,
    };
  }

  return {
    success: "Please check your email",
    error: "",
  };
};

const updatePassword = async (formData: FormData) => {
  const supabase = await createClientForServer();

  const password = formData.get("password");

  // Ensure password is a string or undefined
  if (password === null) {
    return {
      success: "",
      error: "Password is required", // You could add some validation here if you want
    };
  }

  const { data, error } = await supabase.auth.updateUser({
    password: password as string, // Casting password to string if not null
  });

  if (error) {
    console.log("error", error);

    return {
      success: "",
      error: error.message,
    };
  }

  return {
    success: "Password updated",
    error: "",
  };
};

export { updatePassword, sendResetPasswordEmail };
