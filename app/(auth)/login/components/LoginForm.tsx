import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth-actions";
import SignInWithGoogleButton from "./SignInWithGoogleButton";

export function LoginForm() {
  return (
    <Card className="mx-auto w-full">
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
        <form action="">
          <div className="grid gap-4">
            <div className="grid gap-2 mt-4">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email or username"
                className="text-sm"
                required
              />
            </div>
            <div className="grid">
              <div className="flex items-center"></div>
              <Input
                id="password"
                name="password"
                type="password"
                className="text-sm"
                placeholder="Enter password"
                required
              />
              <Link
                href="#"
                className="ml-auto inline-block text-xs underline p-2"
              >
                Forgot your password?
              </Link>
            </div>
            <Button type="submit" formAction={login} className="w-full">
              Login
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
