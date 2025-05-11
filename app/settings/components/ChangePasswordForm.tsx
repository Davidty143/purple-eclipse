'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createClient } from '@/app/utils/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') setShowCurrent((prev) => !prev);
    else if (field === 'new') setShowNew((prev) => !prev);
    else setShowConfirm((prev) => !prev);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user?.email) {
        setMessage('Unable to get user session.');
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      const signInResult = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword
      });

      if (signInResult.error) {
        setMessage('Current password is incorrect.');
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setMessage(updateError.message);
        setIsSuccess(false);
      } else {
        setMessage('Password updated successfully!');
        setIsSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-300">
      <CardHeader className="py-2 border-b border-gray-300 bg-gray-50">
        <CardTitle className="text-md font-medium">Change Your Password</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleChangePassword} className="space-y-6 max-w-2xl">
          <div className="relative">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="pr-10" />
            <button type="button" onClick={() => toggleVisibility('current')} className="absolute right-2 top-9 text-muted-foreground">
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="pr-10" />
            <button type="button" onClick={() => toggleVisibility('new')} className="absolute right-2 top-9 text-muted-foreground">
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10" />
            <button type="button" onClick={() => toggleVisibility('confirm')} className="absolute right-2 top-9 text-muted-foreground">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {message && <p className={`text-sm ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}

          <Button type="submit" disabled={loading} className="w-full text-sm font-medium py-5 bg-[#267858] hover:bg-[#267858] hover:bg-opacity-90">
            {loading ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
