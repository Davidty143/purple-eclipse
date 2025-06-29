import { Inter } from 'next/font/google';
import Image from 'next/image';
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
import Link from 'next/link';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

const HeaderFallback = () => (
  <div className="h-full w-300px flex items-center justify-center">
    <Skeleton className="h-8 w-48" />
  </div>
);

const SearchBarFallback = () => (
  <div className="py-4 h-full w-300px flex pl-2 items-center justify-center">
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
      <body className={cn('bg-background', inter.className)}>
        <AuthProvider serverUser={user}>
          <AccountStatusChecker />
          <div className="w-full">
            <div className="topmost-header bg-gray-900 w-full flex justify-center">
              <div className="">{}</div>
            </div>

            <div className="menu-header h-[60px] w-full lg:border-b flex items-center justify-center">
              <div className="menu-header h-[60px] w-full max-w-[1250px] 2xl:max-w-[80%] mx-auto flex justify-between items-center">
                {/* LOGO Section with Hamburger for Mobile */}
                <div className="ml-2 flex items-center justify-start gap-2 min-h-[60px]">
                  <MobileSidebarMenu />
                  <Link href="/" className="relative w-[160px] h-[40px] cursor-pointer">
                    <Image src="/visconn_transaprent6.png" alt="Visconn Logo" fill sizes="(max-width: 768px) 100px, 160px" className="object-contain" priority />
                  </Link>
                </div>

                {/* Login Section */}
                <div className={cn('menu-header h-full flex items-center justify-end flex-shrink-0 gap-4 pr-3.5')}>
                  <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                    <AuthHeader />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* Bottom Green Header */}
            <div className={cn('menu-header h-16 w-full p-3 2xl:p-4 items-center justify-center hidden lg:flex border-b')}>
              <div className={cn('menu-header h-full w-[1250px] xl:w-[90%] 2xl:w-[80%] flex justify-between items-center')}>
                <div className={cn('menu-header h-full w-300px flex items-center justify-center')}>
                  <Suspense fallback={<HeaderFallback />}>
                    <Header />
                  </Suspense>
                </div>

                {/* SearchBar - Desktop only */}
                <div className={cn('menu-header py-4 h-full w-300px pl-2 items-center justify-center hidden md:flex')}>
                  <Suspense fallback={<SearchBarFallback />}>
                    <SearchBar />
                  </Suspense>
                </div>
              </div>
            </div>

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
              <Footer />
            </Suspense>

            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
