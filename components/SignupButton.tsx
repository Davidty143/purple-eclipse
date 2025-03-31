"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MdOutlineLogin } from "react-icons/md";

interface SignupProps {
  className?: string;
}

const Signup: React.FC<SignupProps> = ({ className }) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase.auth]); // Only run once on mount

  if (user) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={() => {
        router.push("/signup");
      }}
      className={`focus:outline-none focus:ring-0 focus:border-none border-none ${className}`}
    >
      <MdOutlineLogin className="text-lg mr-2 border-none" /> {/* Icon */}
      <span>Register</span> {/* Text */}
    </Button>
  );
};

export default Signup;
