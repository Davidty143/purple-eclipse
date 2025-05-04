//layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/lib/AuthProvider';
import AuthHeader from './layout/components/AuthHeader';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import '@radix-ui/themes/styles.css';
import Logo from './layout/components/Logo';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createClientForServer } from '@/app/utils/supabase/server';

const inter = Inter({ subsets: ['latin'] });

// Loading fallbacks
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
          <div className="w-full">
            <div className="w-full header-wrapper border-b border-gray-300">
              {/* Menu Header */}
              <div className={cn('menu-header h-16 w-full border-b border-gray-300 flex items-center justify-center')}>
                <div className={cn('menu-header h-full w-full max-w-[1250px] xl:w-[80%] flex justify-between items-center')}>
                  {/* LOGO Section */}
                  <div className={cn('menu-header h-[60px] w-auto flex items-center justify-start py-5')}>
                    <Logo />
                  </div>

                  {/* Login Section */}
                  <div className={cn('menu-header h-full flex items-center justify-end flex-shrink-0 gap-4')}>
                    <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                      <AuthHeader />
                    </Suspense>
                  </div>
                </div>
              </div>

              {/* Bottom Green Header */}
              <div className={cn('menu-header h-16 w-full flex p-4 items-center justify-center')}>
                <div className={cn('menu-header h-full w-[1250px] xl:w-[80%] flex justify-between items-center')}>
                  <div className={cn('menu-header h-full w-300px flex items-center justify-center')}>
                    <Suspense fallback={<HeaderFallback />}>
                      <Header />
                    </Suspense>
                  </div>
                  <div className={cn('menu-header py-4 h-full w-300px flex pl-2 items-center justify-center')}>
                    <Suspense fallback={<SearchBarFallback />}>
                      <SearchBar />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="min-h-[600px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
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
