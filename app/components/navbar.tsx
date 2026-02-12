"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '../types';

interface NavbarProps {
  userRole?: UserRole; // Optional now as we might derive it or pass it from layout
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole = 'client', onLogout }) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItemClass = (path: string) =>
    `relative py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${isActive(path)
      ? 'text-white border-b-2 border-white'
      : 'text-indigo-200 hover:text-white'
    }`;

  return (
    <nav className="w-full bg-[#1a237e] border-b border-indigo-800 sticky top-0 z-40 text-white">
      <div className="max-w-[95%] mx-auto px-4 h-24 flex justify-between items-center">

        {/* Brand Identity */}
        <Link
          href="/client_dashboard/production"
          className="flex flex-col items-center cursor-pointer group"
        >
          <h1 className="font-serif text-3xl italic tracking-tighter text-white leading-none group-hover:text-indigo-200 transition-colors">
            François
          </h1>
          <span className="text-[9px] font-sans text-indigo-200 tracking-[0.4em] uppercase mt-1">
            Bertho Production
          </span>
        </Link>

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

        {/* User Actions & Profile */}
        <div className="flex items-center gap-6">
          {userRole ? (
            <div className="flex items-center gap-6 border-l border-indigo-700 pl-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-tighter bg-indigo-800 px-2 py-0.5 rounded">
                  {userRole}
                </span>
                <button
                  onClick={onLogout}
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
    </nav>
  );
};