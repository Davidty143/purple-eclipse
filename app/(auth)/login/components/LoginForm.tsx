"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth-actions";
import SignInWithGoogleButton from "./SignInWithGoogleButton";

export function LoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("emailOrUsername", emailOrUsername);
    formData.append("password", password);

    try {
      const result = await login(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-[350px] sm:w-[400px] h-[500px] sm-h-[600px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center font-semibold">
          VISCONN
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-start text-sm font-semibold text-gray-900 py-2">
          Login
        </div>
        <SignInWithGoogleButton />
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2 mt-4">
              <Input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                placeholder="Enter email or username"
                className="text-sm"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid">
              <Input
                id="password"
                name="password"
                type="password"
                className="text-sm"
                placeholder="Enter password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <Link
                href="#"
                className="ml-auto inline-block text-xs underline p-2"
              >
                Forgot your password?
              </Link>
            </div>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
