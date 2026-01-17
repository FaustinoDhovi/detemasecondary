"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BookOpen, Wallet, Calendar, 
  FileText, LogOut, Bell, Menu, X, Settings 
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Scroll effect for the main content
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 3000);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Overview', href: '/portal/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Grades', href: '/portal/dashboard/grades', icon: <BookOpen size={20} /> },
    { label: 'Assignments', href: '/portal/dashboard/assignments', icon: <FileText size={20} /> },
    { label: 'Timetable', href: '/portal/dashboard/timetable', icon: <Calendar size={20} /> },
    { label: 'Fees', href: '/portal/dashboard/fees', icon: <Wallet size={20} /> },
    { label: 'Settings', href: '/portal/dashboard/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      
      {/* 1. Glassmorphism Sidebar (95% Transparent) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 
        /* Transparency Logic */
        bg-white/5 backdrop-blur-xl border-r border-white/10
        /* Transitions */
        transform transition-all duration-500 ease-in-out xl:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-8">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20">D</div>
            <span className="font-black text-xl tracking-tighter italic text-slate-900">DETEMA</span>
          </div>

          {/* Navigation with Hover Effects */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out - Low Profile */}
          <div className="mt-auto pt-8 border-t border-slate-200/50">
             <Link href="/portal" className="flex items-center gap-4 px-6 py-3 text-slate-400 hover:text-red-500 transition-all font-bold text-sm">
                <LogOut size={20} /> Sign Out
             </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Viewport - Now Full Width */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="xl:hidden bg-slate-900/10 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-[60]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">D</div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-900 text-white rounded-xl">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Desktop Navbar (Transparent) */}
        <header className="hidden xl:flex bg-transparent px-10 py-6 items-center justify-between sticky top-0 z-40 ml-72">
           <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Student Environment</div>
           <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-1.5 pr-4 rounded-2xl border border-white/20">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">TM</div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900 leading-none">Tendai Moyo</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Form 4-A</p>
              </div>
           </div>
        </header>

        {/* Content Area - Moves behind the sidebar on scroll */}
        <main className={`
          flex-1 p-4 sm:p-8 lg:p-12 xl:pl-80 w-full transition-opacity duration-700 ease-in-out
          ${isScrolling ? 'opacity-5' : 'opacity-100'}
        `}>
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 xl:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
}