'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaLeaf, FaSnowflake, FaGraduationCap, FaChartLine, FaCreditCard, FaUsers, FaTrophy, FaRobot, FaSignInAlt, FaSignOutAlt, FaUserCircle, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useSeasonalTheme } from '@/components/SeasonalThemeProvider';

const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme } = useSeasonalTheme();
  const SeasonIcon = theme === 'winter' ? FaSnowflake : FaLeaf;
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navItems = [
    { href: '/', label: 'Home', icon: SeasonIcon },
    { href: '/education', label: 'Learn', icon: FaGraduationCap },
    { href: '/credit-builder', label: 'Credit Builder', icon: FaCreditCard },
    { href: '/investing', label: 'Invest', icon: FaChartLine },
    { href: '/navigator', label: 'Navigator', icon: FaRobot },
    { href: '/mentorship', label: 'Mentors', icon: FaUsers },
    { href: '/achievements', label: 'Achievements', icon: FaTrophy },
  ];

  return (
    <>
      <nav className="bg-gradient-to-r from-secondary to-darkwood shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <SeasonIcon className="text-accent text-2xl group-hover:rotate-12 transition-transform" />
              <div className="leading-tight">
                <div className="text-white font-serif text-xl font-bold">WealthBridge</div>
                <div className="text-white text-[10px] uppercase tracking-[0.2em]">Powered by RMA</div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isCreditBuilder = item.href === '/credit-builder';
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${isActive
                        ? 'bg-primary text-white'
                        : isCreditBuilder
                          ? 'bg-white/80 text-secondary border border-amber hover:bg-white'
                          : 'text-accent hover:bg-amber hover:text-secondary'
                      }`}
                  >
                    <Icon className="text-sm" />
                    <span className={`text-sm font-medium ${isCreditBuilder ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/profile" className="flex items-center space-x-2 text-accent hover:text-white transition-colors">
                    <FaUserCircle className="text-2xl" />
                    <span className="text-sm">{user.displayName || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 text-accent hover:text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaSignInAlt />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center space-x-2 bg-primary hover:bg-amber text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaUserCircle />
                    <span className="text-sm font-medium">Sign Up</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-accent p-2"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      {/* Mobile Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-secondary to-darkwood z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <SeasonIcon className="text-accent text-xl" />
            <span className="text-white font-serif text-lg font-bold">Menu</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-accent p-1" aria-label="Close menu">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <div className="px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isCreditBuilder = item.href === '/credit-builder';
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-primary text-white'
                    : isCreditBuilder
                      ? 'bg-white/80 text-secondary'
                      : 'text-accent hover:bg-white/10'
                  }`}
              >
                <Icon className="text-lg" />
                <span className={`text-sm font-medium ${isCreditBuilder ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Drawer Auth */}
        <div className="px-4 py-4 border-t border-white/20 space-y-2">
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-accent hover:bg-white/10 rounded-lg transition-colors"
              >
                <FaUserCircle className="text-xl" />
                <span className="text-sm font-medium">{user.displayName || 'Profile'}</span>
              </Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-accent hover:bg-white/10 rounded-lg transition-colors"
              >
                <FaSignInAlt className="text-lg" />
                <span className="text-sm font-medium">Login</span>
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary hover:bg-amber text-white rounded-lg transition-colors"
              >
                <FaUserCircle className="text-lg" />
                <span className="text-sm font-medium">Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
