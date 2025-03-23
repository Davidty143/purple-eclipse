"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signup } from "@/lib/auth-actions";

export function SignUpForm() {
  const [passwordError, setPasswordError] = useState<string | null>(null); // State to manage password errors

  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;

    if (password !== passwordConfirm) {
      setPasswordError("Passwords do not match.");

      if (passwordRef.current) passwordRef.current.value = "";
      if (passwordConfirmRef.current) passwordConfirmRef.current.value = "";
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");

      // Clear the password fields if the password is too short
      if (passwordRef.current) passwordRef.current.value = "";
      if (passwordConfirmRef.current) passwordConfirmRef.current.value = "";
      return;
    }

    setPasswordError(null);

    await signup(formData);
  };

  return (
    <Card className="mx-auto w-[350px] sm:w-[400px] h-[500px]">
      <CardHeader>
        <CardTitle className="text-xl text-center">Visconn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-start text-sm font-semibold text-gray-900 py-2">
          Signup
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2 mt-4">
              <Input
                name="username"
                id="username"
                placeholder="Enter Username"
                required
              />
            </div>
            <div className="grid">
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="Enter Email"
                required
              />
            </div>
            <div className="grid">
              <Input
                name="password"
                id="password"
                type="password"
                placeholder="Enter Password"
                required
                ref={passwordRef} // Link the ref to the password input
              />
            </div>
            <div className="grid">
              <Input
                name="password_confirm"
                id="password_confirm"
                type="password"
                placeholder="Re-enter Password"
                required
                ref={passwordConfirmRef} // Link the ref to the confirm password input
              />
            </div>

            {/* Show password mismatch error or length validation error if any */}
            {passwordError && (
              <div className="text-red-500 text-sm mt-2">{passwordError}</div>
            )}

            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
