'use client';
import { ResetPasswordOverlay } from './components/ResetPasswordForm';
import { useRouter } from 'next/navigation';

const ResetPasswordPage = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <ResetPasswordOverlay onClose={() => router.push('/')} onOpenLogin={() => router.push('/login')} />
    </div>
  );
};

export default ResetPasswordPage;
