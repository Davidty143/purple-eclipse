"use client";
import { useEffect } from "react";

export default function PreloadAuth() {
  useEffect(() => {
    // Preload auth components
    import("@/components/LoginLogoutButton");
    import("@/components/SignupButton");
    import("@/components/LoginLogoutButton");
    import("@/components/SignupButton");
  }, []);

  return null;
}

<PreloadAuth />;
