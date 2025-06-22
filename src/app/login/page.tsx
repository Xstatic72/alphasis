"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, User, ShieldCheck, Users, BookOpen, UserCheck } from 'lucide-react';

type DemoUser = {
  PersonID: string;
  FirstName: string;
  LastName: string;
  role: string;
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchDemoUsers();
  }, []);

  const fetchDemoUsers = async () => {
    try {
      const response = await fetch('/api/demo-users');
      if (response.ok) {
        const data = await response.json();
        setDemoUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching demo users:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { user } = await response.json();        // Redirect based on role
        switch (user.role) {
          case 'PARENT':
            router.push('/parent');
            break;
          case 'TEACHER':
            router.push('/teacher');
            break;
          case 'STUDENT':
            router.push('/student');
            break;
        }
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (user: DemoUser) => {
    setUsername(user.PersonID);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            AlphaSIS
          </h1>
          <p className="text-gray-600 mt-2">School Information System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/40 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>          {/* Demo Users */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Demo Users (Click to auto-fill) - Password: password123</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {demoUsers.map((user) => (
                <button
                  key={user.PersonID}
                  onClick={() => quickLogin(user)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {user.role === 'TEACHER' && <UserCheck className="h-5 w-5 text-green-500" />}
                    {user.role === 'PARENT' && <Users className="h-5 w-5 text-blue-500" />}
                    {user.role === 'STUDENT' && <BookOpen className="h-5 w-5 text-orange-500" />}
                    <div>
                      <div className="font-medium">{user.FirstName} {user.LastName}</div>
                      <div className="text-sm text-gray-500">
                        {user.PersonID} • {user.role.toLowerCase()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {demoUsers.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  Loading demo users...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
