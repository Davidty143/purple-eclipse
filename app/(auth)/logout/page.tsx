//logout/page.tsx

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/"), 1000);
    return () => clearTimeout(timer);
  }, []);

  return <div>Logged out. Redirecting...</div>;
};

export default LogoutPage;
