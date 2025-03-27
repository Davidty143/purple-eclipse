"use client";
import LoginButton from "@/components/LoginLogoutButton";
import Signup from "@/components/SignupButton";

export default function LoggedOutHeaderRight() {
  return (
    <div className="flex items-center gap-4">
      <LoginButton />
      <Signup className="hidden sm:inline-flex" />
    </div>
  );
}
