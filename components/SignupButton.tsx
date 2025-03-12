"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";
import { MdOutlineLogin } from "react-icons/md";

const Signup = () => {
  const [user, setUser] = useState<any>(null); // Track user state
  const router = useRouter();
  const supabase = createClient();

  // Fetch user information on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []); // Only run once on mount

  // If user is logged in, don't show the button
  if (user) {
    return null; // You can return null or another component here
  }

  // If user is not logged in, show the signup button
  return (
    <Button
      variant="outline"
      onClick={() => {
        router.push("/signup");
      }}
    >
      <MdOutlineLogin className="text-lg mr-2" /> {/* Icon */}
      <span>Register</span> {/* Text */}
    </Button>
  );
};

export default Signup;
