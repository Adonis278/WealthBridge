'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaLeaf, FaGraduationCap, FaChartLine, FaCreditCard, FaUsers, FaTrophy, FaRobot, FaSignInAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', icon: FaLeaf },
    { href: '/education', label: 'Learn', icon: FaGraduationCap },
    { href: '/credit-builder', label: 'Credit Builder', icon: FaCreditCard },
    { href: '/investing', label: 'Invest', icon: FaChartLine },
    { href: '/navigator', label: 'Navigator', icon: FaRobot },
    { href: '/mentorship', label: 'Mentors', icon: FaUsers },
    { href: '/achievements', label: 'Achievements', icon: FaTrophy },
  ];

  return (
    <nav className="bg-gradient-to-r from-secondary to-darkwood shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <FaLeaf className="text-accent text-2xl group-hover:rotate-12 transition-transform" />
            <span className="text-accent font-serif text-xl font-bold">WealthBridge</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-accent hover:bg-amber hover:text-secondary'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center space-x-2 text-accent hover:text-white transition-all">
                  <FaUserCircle className="text-2xl" />
                  <span className="text-sm">{user.displayName || 'Profile'}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  <FaSignOutAlt />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-2 text-accent hover:text-white px-4 py-2 rounded-lg transition-all"
                >
                  <FaSignInAlt />
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center space-x-2 bg-primary hover:bg-amber text-white px-4 py-2 rounded-lg transition-all"
                >
                  <FaUserCircle />
                  <span className="text-sm font-medium">Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-accent p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
