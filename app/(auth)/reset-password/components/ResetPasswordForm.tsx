"use client";
import { sendResetPasswordEmail } from "@/lib/auth-actions";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const ResetPasswordForm = () => {
  const [state, formAction, isPending] = useActionState(
    async (state: { error: string; success: string }, formData: FormData) => {
      const { error, success } = await sendResetPasswordEmail(formData);
      return { error, success };
    },
    { error: "", success: "" }
  );

  const { error, success } = state;

  return (
    <Card className="mx-auto w-[350px] sm:w-[400px] h-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center font-semibold">
          VISCONN
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-start text-sm font-semibold text-gray-900 pb-4">
          Reset Password
        </div>

        <form action={formAction}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="text-sm"
                required
                disabled={isPending}
              />
            </div>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            {success && (
              <div className="text-green-500 text-sm mt-2">{success}</div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Sending..." : "Send Reset Email"}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
