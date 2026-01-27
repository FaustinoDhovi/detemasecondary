"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, LogOut, Home } from "lucide-react";
import Link from "next/link";

export default function WaitingApproval() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        router.push("/portal");
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/portal");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-white text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-white" size={32} />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-3">
            Account <span className="text-amber-600">Pending Approval</span>
          </h1>
          
          <p className="text-slate-600 mb-8">
            Your staff account registration has been received successfully.
            Please wait for administrator approval before you can access the portal.
          </p>
          
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="text-amber-600 shrink-0" size={24} />
              <div className="text-left">
                <h3 className="font-bold text-amber-900 mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Administrator will review your application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>You will receive email notification upon approval</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>You can then login with your credentials</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
            
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              <Home size={18} />
              Return to Homepage
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              For assistance, contact the school administration at{" "}
              <a href="mailto:admin@detemasecondary.ac.zw" className="text-blue-600 hover:underline">
                admin@detemasecondary.ac.zw
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}