// components/SetUsernameForm.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateUsername } from '@/lib/auth-actions';
import { User } from 'lucide-react';

export function SetUsernameForm() {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  // Client-side validation
  const validateUsername = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      return 'Username must be between 3 and 20 characters.';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return 'Username can only contain letters, numbers, and underscores.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }

    setIsLoading(true);
    setUsernameError(null);

    const formData = new FormData();
    formData.append('username', username.trim());

    try {
      await updateUsername(formData);
      window.location.href = '/'; // Redirect after successful update
    } catch (error: any) {
      setUsernameError(error.message || 'Failed to set username.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    const error = validateUsername(value);
    setUsernameError(error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <Card className="mx-auto w-[350px] sm:w-[400px] h-[460px] relative shadow-lg rounded-xl">
        <button onClick={() => (window.location.href = '/')} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" aria-label="Close form">
          ✕
        </button>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#267858]">Welcome to VISCONN 👋</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Before you dive in, choose your username. It’ll represent you across the platform.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 mt-4">
              <div className={`flex items-center gap-3 h-12 border rounded-2xl px-4 bg-white transition ${usernameError ? 'border-red-500' : 'border-gray-300 focus-within:ring-2 focus-within:ring-[#267858]'}`}>
                <User className="text-gray-400 w-5 h-5" />
                <input id="username" name="username" type="text" placeholder="Choose a unique username" className="flex-1 bg-transparent outline-none text-sm" value={username} onChange={handleUsernameChange} required ref={usernameRef} disabled={isLoading} />
              </div>

              {/* Error Message */}
              {usernameError && <div className="text-red-500 text-sm mt-1">{usernameError}</div>}

              <Button type="submit" className="w-full h-12 text-base rounded-2xl bg-[#267858] hover:bg-[#1f5e4a] transition text-white" disabled={isLoading || !!usernameError}>
                {isLoading ? 'Setting...' : 'Set Username'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
