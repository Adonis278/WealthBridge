'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaLeaf, FaSnowflake, FaGraduationCap, FaChartLine, FaCreditCard,
  FaUsers, FaTrophy, FaRobot, FaSignInAlt, FaSignOutAlt, FaUserCircle,
  FaBars, FaTimes,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useSeasonalTheme } from '@/components/SeasonalThemeProvider';

const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme } = useSeasonalTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const SeasonIcon = theme === 'winter' ? FaSnowflake : FaLeaf;

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

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
            <Link href="/" className="flex items-center space-x-2 group" onClick={() => setIsMenuOpen(false)}>
              <SeasonIcon className="text-accent text-2xl group-hover:rotate-12 transition-transform" />
              <div className="leading-tight">
                <div className="text-white font-serif text-xl font-bold">WealthBridge</div>
                <div className="text-white text-[10px] uppercase tracking-[0.2em]">Powered by RMA</div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isCreditBuilder = item.href === '/credit-builder';
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      isActive
                        ? 'bg-primary text-white'
                        : isCreditBuilder
                          ? 'bg-white/80 text-secondary border border-amber hover:bg-white font-semibold'
                          : 'text-accent hover:bg-amber hover:text-secondary'
                    }`}
                  >
                    <Icon className="text-sm shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <Link href="/profile" className="flex items-center space-x-2 text-accent hover:text-white transition-all">
                    <FaUserCircle className="text-2xl" />
                    <span className="text-sm truncate max-w-[120px]">{user.displayName || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 text-accent hover:text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    <FaSignInAlt />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center space-x-2 bg-primary hover:bg-amber text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    <FaUserCircle />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden text-accent p-2 rounded-lg hover:bg-white/10 transition-all focus:outline-none"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Slide-in drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-gradient-to-b from-secondary to-darkwood shadow-2xl z-50 md:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
                <div className="flex items-center space-x-2">
                  <SeasonIcon className="text-accent text-xl" />
                  <span className="text-white font-serif font-bold text-lg">WealthBridge</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-accent hover:text-white p-1 rounded-lg transition-all"
                  aria-label="Close menu"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isCreditBuilder = item.href === '/credit-builder';
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                          isActive
                            ? 'bg-primary text-white'
                            : isCreditBuilder
                              ? 'bg-white/90 text-secondary font-semibold'
                              : 'text-accent hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="text-base shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Auth section */}
              <div className="px-3 py-4 border-t border-white/20 space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-accent hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                    >
                      <FaUserCircle className="text-lg shrink-0" />
                      <span className="truncate">{user.displayName || 'Profile'}</span>
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all text-sm font-medium"
                    >
                      <FaSignOutAlt className="shrink-0" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-accent hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                    >
                      <FaSignInAlt className="shrink-0" />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-primary hover:bg-amber text-white transition-all text-sm font-medium"
                    >
                      <FaUserCircle className="shrink-0" />
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
