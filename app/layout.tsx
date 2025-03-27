import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import LoginButton from "@/components/LoginLogoutButton";
import SignupButton from "@/components/SignupButton";
import LoggedOutHeaderRight from "./layout/components/LoggedOutHeaderRight";
import { AuthProvider } from "@/lib/AuthProvider";

import AuthHeader from "./layout/components/AuthHeader";

import LoggedInHeaderRight from "./layout/components/LoggedInHeaderRight";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import "@radix-ui/themes/styles.css";
import PreloadAuth from "./layout/components/PreloadAuth";
import PreloadAuthRoutes from "./layout/components/PreloadAuthRoutes";
import Logo from "./layout/components/Logo"; // Import the new Logo component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Visconn",
  description: "Visconn Discussion Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("bg-background", inter.className)}>
        <AuthProvider>
          <PreloadAuth />
          <PreloadAuthRoutes />
          {/* Wrapper div to hold all elements */}
          <div className="w-full">
            {/* Wrapper for both headers */}
            <div className="w-full header-wrapper border-b border-gray-300">
              {/* Menu Header */}
              <div
                className={cn(
                  "menu-header",
                  "h-16",
                  "w-full",
                  "border-b",
                  "border-gray-300",
                  "flex",
                  "items-center",
                  "justify-center"
                )}
              >
                {/* Inner Div centered within the Menu */}
                <div
                  className={cn(
                    "menu-header",
                    "h-full", // Use full height for inner div
                    "w-full", // Make it responsive to available width
                    "max-w-[1250px]", // Max width for larger screens
                    "xl:w-[80%]", // 80% width on xl screens
                    "p-4",
                    "flex",
                    "justify-between", // Space out the children in the flex container
                    "items-center" // Center the items vertically
                  )}
                >
                  {/* LOGO Section */}
                  <div
                    className={cn(
                      "menu-header",
                      "h-[60px]", // Height for logo container
                      "w-auto", // Width should be auto to avoid fixed size
                      "flex",
                      "items-center",
                      "justify-start",
                      "py-5"
                    )}
                  >
                    <Logo />
                  </div>

                  {/* Login Section */}
                  <div
                    className={cn(
                      "menu-header",
                      "h-full", // Take full height of the parent
                      "flex",
                      "items-center",
                      "justify-end",
                      "flex-shrink-0"
                    )}
                  >
                    <AuthHeader />
                  </div>
                </div>
              </div>

              {/* Bottom Green Header */}
              <div
                className={cn(
                  "menu-header",
                  "h-16",
                  "w-full",
                  "flex",
                  "p-4",
                  "items-center",
                  "justify-center"
                )}
              >
                <div
                  className={cn(
                    "menu-header",
                    "h-full", // Use full height for inner div
                    "w-[1250px]",
                    "xl:w-[80%]",
                    "flex",
                    "justify-between", // Space out the children in the flex container
                    "items-center" // Center the items vertically
                  )}
                >
                  {" "}
                  <div
                    className={cn(
                      "menu-header",
                      "h-full", // Take full height of the parent
                      "w-300px", // Width as 10% of parent
                      "flex",
                      "items-center",
                      "justify-center"
                    )}
                  >
                    <Header />
                  </div>
                  <div
                    className={cn(
                      "menu-header",
                      "py-4",
                      "h-full", // Take full height of the parent
                      "w-300px", // Width as 10% of parent
                      "flex",
                      "pl-2",
                      "items-center",
                      "justify-center"
                    )}
                  >
                    <SearchBar />
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* End of header-wrapper */}
            {/* Children content */}
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
