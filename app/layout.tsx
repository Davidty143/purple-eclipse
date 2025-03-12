import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import LoginButton from "@/components/LoginLogoutButton";
import SignupButton from "@/components/SignupButton";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import "@radix-ui/themes/styles.css";

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
        {/* Wrapper div to hold all elements */}
        <div className="w-full px-2">
          {/* Wrapper for both headers */}
          <div className="header-wrapper">
            {/* Menu Header */}
            <div
              className={cn(
                "menu-header",
                "bg-blue-200",
                "h-16",
                "w-full",
                "flex",
                "items-center",
                "justify-center"
              )}
            >
              {/* Inner Div centered within the Menu */}
              <div
                className={cn(
                  "menu-header",
                  "bg-blue-500",
                  "h-full", // Use full height for inner div
                  "w-[1250px]",
                  "2xl:w-[80%]",
                  "flex",
                  "justify-between", // Space out the children in the flex container
                  "items-center" // Center the items vertically
                )}
              >
                {/* LOGO Section */}
                <div
                  className={cn(
                    "menu-header",
                    "bg-red-300",
                    "h-full", // Take full height of the parent
                    "w-[150px]", // Width as 10% of parent
                    "flex",
                    "items-center",
                    "justify-center"
                  )}
                >
                  LOGO
                </div>

                {/* Login Section */}
                <div
                  className={cn(
                    "menu-header",
                    "bg-violet-300",
                    "h-full", // Take full height of the parent
                    "w-[300px]", // Width as 10% of parent
                    "flex",
                    "items-center",
                    "justify-end",
                    "flex-shrink-0"
                  )}
                >
                  <SignupButton />
                  <LoginButton />
                </div>
              </div>
            </div>

            {/* Bottom Green Header */}
            <div
              className={cn(
                "menu-header",
                "bg-green-200",
                "h-16",
                "w-full",
                "flex",
                "items-center",
                "justify-center"
              )}
            >
              <div
                className={cn(
                  "menu-header",
                  "bg-yellow-200",
                  "h-full", // Use full height for inner div
                  "w-[1250px]",
                  "2xl:w-[80%]",
                  "flex",
                  "justify-between", // Space out the children in the flex container
                  "items-center" // Center the items vertically
                )}
              >
                {" "}
                <div
                  className={cn(
                    "menu-header",
                    "bg-pink-300",
                    "h-full", // Take full height of the parent
                    "w-[200px]", // Width as 10% of parent
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
                    "bg-orange-300",
                    "h-full", // Take full height of the parent
                    "w-[300px]", // Width as 10% of parent
                    "flex",
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
      </body>
    </html>
  );
}
