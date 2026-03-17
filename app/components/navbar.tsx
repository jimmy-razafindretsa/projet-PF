"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '../types';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  userRole?: UserRole; // Optional now as we might derive it or pass it from layout
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole = 'client', onLogout }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navItemClass = (path: string) =>
    `relative py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${isActive(path)
      ? 'text-white border-b-2 border-white'
      : 'text-indigo-200 hover:text-white'
    }`;

  const mobileNavItemClass = (path: string) =>
    `block py-3 text-sm uppercase tracking-widest font-semibold transition-all duration-300 ${isActive(path)
      ? 'text-white bg-indigo-800/50 pl-4 border-l-4 border-white'
      : 'text-indigo-200 hover:text-white hover:bg-indigo-800/30 pl-4'
    }`;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-full bg-[#1a237e] border-b border-indigo-800 sticky top-0 z-40 text-white">
      <div className="max-w-[95%] mx-auto px-4 h-24 flex justify-between items-center">

        {/* Brand Identity */}
        {userRole === 'supplier' ? (
          <div className="flex flex-col items-center">
            <h1 className="font-sans font-medium text-2xl italic tracking-tight text-white leading-none">
              François Bertho
            </h1>
            <span className="text-[9px] font-sans text-indigo-200 tracking-[0.4em] uppercase mt-1">
              PRODUCTION
            </span>
          </div>
        ) : (
          <Link
            href="/client_dashboard/production"
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <h1 className="font-sans font-medium text-2xl italic tracking-tight text-white leading-none group-hover:text-indigo-200 transition-colors">
              François Bertho
            </h1>
            <span className="text-[9px] font-sans text-indigo-200 tracking-[0.4em] uppercase mt-1">
              PRODUCTION
            </span>
          </Link>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-indigo-200 hover:text-white transition-colors p-2"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10">
          {userRole === 'client' && (
            <>
              <Link
                href="/client_dashboard/new-order"
                className={navItemClass('/client_dashboard/new-order')}
              >
                New Order
              </Link>
              <Link
                href="/client_dashboard/production"
                className={navItemClass('/client_dashboard/production')}
              >
                Production Line
              </Link>

              <Link
                href="/client_dashboard/completed"
                className={navItemClass('/client_dashboard/completed')}
              >
                Archives
              </Link>

            </>
          )}

          {userRole === 'supplier' && (
            <>
              <Link
                href="/supplier_dashboard/production"
                className={navItemClass('/supplier_dashboard/production')}
              >
                Production Line
              </Link>

              <Link
                href="/supplier_dashboard/completed"
                className={navItemClass('/supplier_dashboard/completed')}
              >
                Archives
              </Link>
            </>
          )}
        </div>

        {/* User Actions & Profile (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {userRole ? (
            <div className="flex items-center gap-6 border-l border-indigo-700 pl-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-tighter bg-indigo-800 px-2 py-0.5 rounded">
                  {userRole}
                </span>
                <button
                  onClick={() => onLogout && onLogout()}
                  className="text-[10px] text-indigo-300 hover:text-red-300 uppercase tracking-widest mt-1 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-white font-serif italic text-lg shadow-sm">
                {userRole.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <Link
              href="/"
              className="text-xs font-bold uppercase tracking-widest text-indigo-100 hover:text-white transition-colors"
            >
              Portal Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-24 left-0 w-full bg-[#1a237e] border-b border-indigo-800 shadow-xl py-4 px-4 flex flex-col space-y-4 animate-in slide-in-from-top-2 duration-200">
          {userRole === 'client' && (
            <div className="flex flex-col space-y-1">
              <Link
                href="/client_dashboard/new-order"
                className={mobileNavItemClass('/client_dashboard/new-order')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                New Order
              </Link>
              <Link
                href="/client_dashboard/production"
                className={mobileNavItemClass('/client_dashboard/production')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Production Line
              </Link>
              <Link
                href="/client_dashboard/completed"
                className={mobileNavItemClass('/client_dashboard/completed')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Archives
              </Link>
            </div>
          )}

          {userRole === 'supplier' && (
            <div className="flex flex-col space-y-1">
              <Link
                href="/supplier_dashboard/production"
                className={mobileNavItemClass('/supplier_dashboard/production')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Production Line
              </Link>
              <Link
                href="/supplier_dashboard/completed"
                className={mobileNavItemClass('/supplier_dashboard/completed')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Archives
              </Link>
            </div>
          )}

          {/* User Profile Mobile */}
          <div className="pt-4 border-t border-indigo-800 mt-2">
            {userRole ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-white font-serif italic text-sm shadow-sm">
                    {userRole.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-indigo-100 uppercase tracking-tighter bg-indigo-800 px-2 py-0.5 rounded">
                    {userRole}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-indigo-300 hover:text-red-300 uppercase tracking-widest font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/"
                className="block text-center text-xs font-bold uppercase tracking-widest text-indigo-100 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Portal Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};