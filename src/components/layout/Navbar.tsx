"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  LogOut, 
  UserCheck,
  GraduationCap,
  ClipboardCheck,
  UserPlus,
  CreditCard,
  BarChart3
} from 'lucide-react';

type UserSession = {
  userId: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT';
  name: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function Navbar() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get session from cookie or API
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('No session');
      })
      .then(data => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    router.push('/login');
  };
  // Only show navbar on the home page
  if (pathname !== '/' || !session || loading) {
    return null;
  }

  // Define navigation items based on user role
  const getNavItems = (role: string): NavItem[] => {
    switch (role) {
      case 'STUDENT':
        return [
          { label: 'Dashboard', href: '/student', icon: BarChart3 },
          { label: 'My Subjects', href: '/student/subjects', icon: BookOpen },
          { label: 'Grades', href: '/student/grades', icon: ClipboardCheck },
          { label: 'Attendance', href: '/student/attendance', icon: Calendar },
        ];
      
      case 'TEACHER':
        return [
          { label: 'Dashboard', href: '/teacher', icon: BarChart3 },
          { label: 'Students', href: '/teacher/students', icon: Users },
          { label: 'Subjects', href: '/teacher/subjects', icon: BookOpen },
          { label: 'Grades', href: '/teacher/grades', icon: ClipboardCheck },
          { label: 'Attendance', href: '/teacher/attendance', icon: Calendar },
        ];
      
      case 'PARENT':
        return [
          { label: 'Dashboard', href: '/parent', icon: BarChart3 },
          { label: 'Children', href: '/parent/children', icon: Users },
          { label: 'Academic Reports', href: '/parent/reports', icon: ClipboardCheck },
          { label: 'Payments', href: '/parent/payments', icon: CreditCard },
        ];
      
      default:
        return [];
    }
  };

  const navItems = getNavItems(session.role);

  // Role-based styling
  const getRoleStyles = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return {
          bgClass: 'bg-gradient-to-r from-blue-600 to-blue-700',
          textClass: 'text-blue-100',
          activeClass: 'bg-blue-500 text-white',
          hoverClass: 'hover:bg-blue-500/20'
        };
      case 'TEACHER':
        return {
          bgClass: 'bg-gradient-to-r from-green-600 to-green-700',
          textClass: 'text-green-100',
          activeClass: 'bg-green-500 text-white',
          hoverClass: 'hover:bg-green-500/20'
        };
      case 'PARENT':
        return {
          bgClass: 'bg-gradient-to-r from-purple-600 to-purple-700',
          textClass: 'text-purple-100',
          activeClass: 'bg-purple-500 text-white',
          hoverClass: 'hover:bg-purple-500/20'
        };
      default:
        return {
          bgClass: 'bg-gradient-to-r from-gray-600 to-gray-700',
          textClass: 'text-gray-100',
          activeClass: 'bg-gray-500 text-white',
          hoverClass: 'hover:bg-gray-500/20'
        };
    }
  };

  const styles = getRoleStyles(session.role);

  return (
    <nav className={`${styles.bgClass} shadow-lg sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">AlphaSIS</h1>
              <p className="text-xs text-gray-200 leading-none">
                {session.role.charAt(0) + session.role.slice(1).toLowerCase()} Portal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                             (item.href !== '/student' && item.href !== '/teacher' && item.href !== '/parent' && pathname.startsWith(item.href));
              
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => router.push(item.href)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? styles.activeClass 
                      : `${styles.textClass} ${styles.hoverClass}`
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-white text-sm font-medium">{session.name}</p>
              <p className="text-gray-200 text-xs">
                {session.role.charAt(0) + session.role.slice(1).toLowerCase()}
              </p>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className={`${styles.textClass} ${styles.hoverClass} border border-white/20`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(item.href)}
                  className={`
                    flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs
                    ${isActive 
                      ? styles.activeClass 
                      : `${styles.textClass} ${styles.hoverClass}`
                    }
                  `}
                >
                  <Icon className="h-3 w-3" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
            
            {/* Mobile Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className={`${styles.textClass} ${styles.hoverClass} border border-white/20 flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs`}
            >
              <LogOut className="h-3 w-3" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
