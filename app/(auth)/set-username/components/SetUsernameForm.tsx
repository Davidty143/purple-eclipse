"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateUsername } from "@/lib/auth-actions"; // Import the update function

export function SetUsernameForm() {
  const [usernameError, setUsernameError] = useState<string | null>(null); // State to manage username errors
  const usernameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      await updateUsername(formData); // Pass the form data to the update function
      setUsernameError(null); // Clear any error if the update is successful
      window.location.href = "/"; // Redirect after successful update
    } catch (error: any) {
      setUsernameError(error.message); // Set the error message if update fails
    }
  };

  return (
    <Card className="mx-auto w-[350px] sm:w-[400px] h-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Set Your Username
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-start text-sm font-semibold text-gray-900 py-2">
          Please set your username
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2 mt-4">
              <Input
                name="username"
                id="username"
                placeholder="Enter Username"
                required
                ref={usernameRef} // Link the ref to the username input
              />
            </div>

            {/* Show username validation error if any */}
            {usernameError && (
              <div className="text-red-500 text-sm mt-2">{usernameError}</div>
            )}

            <Button type="submit" className="w-full">
              Set Username
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
