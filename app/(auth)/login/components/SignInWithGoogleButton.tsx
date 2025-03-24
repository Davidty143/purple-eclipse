"use client";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth-actions";
import React from "react";

const SignInWithGoogleButton = () => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full text-sm text-gray-800 !text-left"
      onClick={() => {
        signInWithGoogle();
      }}
    >
      Continue with Google
    </Button>
  );
};

export default SignInWithGoogleButton;
