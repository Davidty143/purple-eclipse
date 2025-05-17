import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/lib/AuthProvider';
import AuthHeader from './layout/components/AuthHeader';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import '@radix-ui/themes/styles.css';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClientForServer } from '@/app/utils/supabase/server';
import MobileSidebarMenu from './layout/components/MobileSidebarMenu';
import { AccountStatusChecker } from './components/AccountStatusChecker';

const inter = Inter({ subsets: ['latin'] });

const HeaderFallback = () => (
  <div className="h-full w-[300px] flex items-center justify-center">
    <Skeleton className="h-8 w-48" />
  </div>
);

const SearchBarFallback = () => (
  <div className="py-4 h-full w-[300px] flex pl-2 items-center justify-center">
    <Skeleton className="h-10 w-56" />
  </div>
);

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClientForServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <head>
        {/* ✅ Preload the logo image */}
        <link rel="preload" href="/visconn_transaprent6.png" as="image" type="image/png" />
      </head>
      <body className={cn('bg-background', inter.className)}>
        <AuthProvider serverUser={user}>
          <AccountStatusChecker />
          <div className="w-full">
            <div className="w-full header-wrapper border-b">
              {/* Top Header */}
              <div className="menu-header h-[60px] w-full lg:border-b flex items-center justify-center">
                <div className="menu-header h-[60px] w-full max-w-[1250px] xl:w-[80%] flex justify-between items-center">
                  {/* Logo + Mobile Menu */}
                  <div className="ml-2 flex items-center justify-start gap-2 min-h-[60px]">
                    <MobileSidebarMenu />
                    <div className="w-[160px] h-[60px] bg-white">
                      <img src="/visconn_transaprent6.png" alt="Visconn Logo" width={160} height={60} loading="eager" className="object-contain w-full h-full" />
                    </div>
                  </div>

                  {/* Auth/Login Section */}
                  <div className="menu-header h-full flex items-center justify-end flex-shrink-0 gap-4 pr-3.5">
                    <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                      <AuthHeader />
                    </Suspense>
                  </div>
                </div>
              </div>

              {/* Bottom Header (Desktop Only) */}
              <div className="menu-header h-16 w-full p-4 items-center justify-center hidden lg:flex">
                <div className="menu-header h-full w-[1250px] xl:w-[80%] flex justify-between items-center">
                  <div className="menu-header h-full w-[300px] flex items-center justify-center">
                    <Suspense fallback={<HeaderFallback />}>
                      <Header />
                    </Suspense>
                  </div>
                  <div className="menu-header py-4 h-full w-[300px] pl-2 items-center justify-center hidden md:flex">
                    <Suspense fallback={<SearchBarFallback />}>
                      <SearchBar />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <Suspense
              fallback={
                <div className="min-h-[600px] flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-64 w-full max-w-3xl" />
                  </div>
                </div>
              }>
              {children}
            </Suspense>

            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
