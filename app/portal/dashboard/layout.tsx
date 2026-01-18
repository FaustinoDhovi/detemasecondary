"use client";
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut, 
  UserCircle,
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
    { name: 'Settings', href: '/portal/dashboard/settings', icon: Settings }, // Added Settings Icon Here
  ];

  const handleLogout = () => {
    localStorage.removeItem('portalSession');
    window.location.href = '/portal';
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 w-72 h-screen bg-slate-900 text-white p-8 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-12">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Detema<span className="text-blue-500">.</span></h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Student Portal</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Student Profile in Sidebar */}
        <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 font-black">
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
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen">
        {/* Mobile Toggle */}
        <button 
          className="md:hidden mb-6 p-4 bg-white rounded-2xl shadow-sm text-slate-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>

        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}