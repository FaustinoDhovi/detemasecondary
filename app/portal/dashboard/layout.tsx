"use client";
export const dynamic = 'force-dynamic'; // <--- ADD THIS LINE HERE
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const session = localStorage.getItem('portalSession');
    if (session) {
      setStudent(JSON.parse(session).student);
    }
  }, []);

  const navigation = [
    { name: 'Overview', href: '/portal/dashboard', icon: LayoutDashboard },
    { name: 'Finance', href: '/portal/dashboard/finance', icon: Wallet },
    { name: 'Reports', href: '/portal/dashboard/grades', icon: BookOpen },
    { name: 'Timetable', href: '/portal/dashboard/timetable', icon: Calendar },
    { name: 'Assignments', href: '/portal/dashboard/assignments', icon: BookOpen },
    { name: 'Settings', href: '/portal/dashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('portalSession');
    window.location.href = '/portal';
  };

  if (!student) return <div className="p-20 text-center font-black animate-pulse">LOADING PROFILE...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900 text-white p-8 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-12">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">
            Detema<span className="text-blue-500">Cloud</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Student Portal</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                // FIX: Collapse sidebar when link is clicked
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl italic">
              {student.name.substring(0, 1)}
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-sm italic uppercase truncate">{student.name}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate">{student.student_class}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen relative">
        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className={`
            md:hidden fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-full shadow-2xl z-[50] transition-transform
            ${isMobileMenuOpen ? 'scale-0' : 'scale-100'}
          `}
        >
          <Menu size={24} />
        </button>

        {/* Close Button (Visible only when menu is open) */}
        {isMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed top-6 right-6 p-4 bg-white text-slate-900 rounded-2xl shadow-xl z-[80]"
          >
            <X size={24} />
          </button>
        )}

        {children}
      </main>
    </div>
  );
}