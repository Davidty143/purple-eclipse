// components/auth/UpdatePasswordForm.tsx
"use client";
import { updatePassword } from "@/lib/auth-actions";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const UpdatePasswordForm = () => {
  const [state, formAction, isPending] = useActionState(updatePassword, {
    error: "",
    success: "",
  });

  const { error, success } = state;

  return (
    <Card className="mx-auto w-[350px] sm:w-[400px] h-[500px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center font-semibold">
          VISCONN
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-start text-sm font-semibold text-gray-900 pb-4">
          Update Password
        </div>

        <form action={formAction}>
          <div className="grid gap-4">
            <div className="grid gap-4">
              <Input
                name="password"
                type="password"
                placeholder="Enter new password"
                className="text-sm"
                required
                disabled={isPending}
              />

              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="text-sm"
                required
                disabled={isPending}
              />

              <div className="text-xs text-muted-foreground mt-1">
                Password must contain:
                <ul className="list-disc pl-4">
                  <li>Minimum 8 characters</li>
                  <li>At least 1 uppercase letter</li>
                  <li>At least 1 number</li>
                </ul>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            {success && (
              <div className="text-green-500 text-sm mt-2">{success}</div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          Return to{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
