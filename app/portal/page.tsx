// app/portal/page.tsx - UPDATED WITH BETTER DEBUGGING
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Shield,
  Loader2,
  CheckCircle2,
  Building,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function StealthPortalLogin() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [id, setId] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const cleanName = name.trim().toLowerCase();
      const cleanId = id.trim();

      console.log("=== LOGIN ATTEMPT START ===");
      console.log("Email:", cleanName);
      console.log("Password length:", cleanId.length);

      /* =======================
         1️⃣ ADMIN OVERRIDE
      ======================== */
      const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

      if (
        adminUsername &&
        adminPassword &&
        cleanName === adminUsername &&
        cleanId === adminPassword
      ) {
        console.log("✅ Admin login successful");
        localStorage.clear();
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_username", cleanName);

        console.log("Admin session stored in localStorage");
        setTimeout(() => {
          console.log("Redirecting to /portal/admin");
          router.push("/portal/admin");
        }, 300);
        return;
      }

      /* =======================
         2️⃣ STAFF REGISTRATION (EC)
      ======================== */
      const ecPattern = /^(0|1|57|20)\d{5,6}[A-Z]$/i;
      if (ecPattern.test(cleanId)) {
        console.log("EC registration detected:", cleanId);
        const ecNumber = cleanId.toUpperCase();

        const { data: staffData } = await supabase
          .from("staff_master_list")
          .select("ec_number, full_name")
          .eq("ec_number", ecNumber)
          .single();

        if (!staffData) {
          setError("Invalid credentials.");
          setLoading(false);
          return;
        }

        localStorage.clear();
        localStorage.setItem("verified_ec", staffData.ec_number);
        localStorage.setItem("verified_name", staffData.full_name);
        localStorage.setItem("staff_registration_initiated", "true");

        setTimeout(() => {
          console.log("Redirecting to /portal/register-staff");
          router.push("/portal/register-staff");
        }, 800);
        return;
      }

      /* =======================
         3️⃣ TEACHER/STAFF LOGIN (EMAIL) - FAUSTINO NYANGARI
      ======================== */
      if (cleanName.includes("@")) {
        console.log("🔍 Looking up teacher with email:", cleanName);
        
        // Lookup staff in staff_profiles table
        const { data: profile, error: profileError } = await supabase
          .from("staff_profiles")
          .select("*")
          .ilike("email_address", cleanName)
          .single();

        console.log("Profile lookup:", { 
          success: !!profile, 
          error: profileError?.message,
          profile: profile 
        });

        if (!profile) {
          console.error("❌ No staff profile found");
          setError("Invalid credentials.");
          setLoading(false);
          return;
        }

        // Check if account is approved and active
        console.log("Account status:", {
          is_approved: profile.is_approved,
          is_active: profile.is_active,
          role: profile.role
        });

        if (!profile.is_approved || !profile.is_active) {
          console.log("❌ Account not approved or inactive");
          setError("Account not active or pending approval.");
          setLoading(false);
          return;
        }

        // Check for FAUSTINO NYANGARI
        if (cleanName === "fnyangari@gmail.com" && cleanId === "Dhovimazheke213#") {
          console.log("✅ FAUSTINO NYANGARI authentication successful!");
          
          // Clear localStorage first
          localStorage.clear();
          console.log("LocalStorage cleared");
          
          // Store teacher session
          localStorage.setItem("teacher_name", profile.full_name);
          localStorage.setItem("teacher_role", profile.role);
          localStorage.setItem("teacher_email", profile.email_address);
          localStorage.setItem("teacher_ec", profile.ec_number);
          localStorage.setItem("teacher_authenticated", "true");
          localStorage.setItem("staff_profile_id", profile.id);
          localStorage.setItem("login_timestamp", Date.now().toString());
          
          // Verify storage
          console.log("✅ Teacher session stored:");
          console.log("- teacher_name:", localStorage.getItem("teacher_name"));
          console.log("- teacher_authenticated:", localStorage.getItem("teacher_authenticated"));
          console.log("- teacher_role:", localStorage.getItem("teacher_role"));
          
          console.log("🔄 Redirecting to /portal/teacher in 500ms...");
          
          // Use window.location for a hard redirect
          setTimeout(() => {
            console.log("📍 Now redirecting to /portal/teacher");
            window.location.href = "/portal/teacher";
          }, 500);
          
          return;
        }

        console.log("❌ Not FAUSTINO or wrong password");
        setError("Invalid credentials.");
        setLoading(false);
        return;
      }

      /* =======================
         4️⃣ STUDENT LOGIN
      ======================== */
      if (!cleanName || !cleanId) {
        setError("Please enter both fields.");
        setLoading(false);
        return;
      }

      console.log("Student login attempt with ID:", cleanId);
      
      if (cleanId.toUpperCase().startsWith("DET") || !isNaN(Number(cleanId))) {
        const studentId = cleanId.toUpperCase();

        const { data: studentData } = await supabase
          .from("student_ledger")
          .select("id, name, student_class, previous_balance, term_1_2026")
          .eq("id", studentId)
          .single();

        if (studentData) {
          console.log("Student found in ledger:", studentData.name);
          const prev = Number(studentData.previous_balance) || 0;
          const term = Number(studentData.term_1_2026) || 0;

          localStorage.clear();
          localStorage.setItem(
            "portalSession",
            JSON.stringify({
              student: {
                id: studentData.id,
                name: studentData.name,
                class: studentData.student_class,
                balance: (prev + term).toString(),
              },
            })
          );

          setTimeout(() => {
            console.log("Redirecting student to /portal/dashboard");
            router.push("/portal/dashboard");
          }, 800);
          return;
        }

        const { data: fallback } = await supabase
          .from("students")
          .select("student_id, full_name, class, balance")
          .eq("student_id", studentId)
          .single();

        if (fallback) {
          console.log("Student found in fallback table:", fallback.full_name);
          localStorage.clear();
          localStorage.setItem(
            "portalSession",
            JSON.stringify({
              student: {
                id: fallback.student_id,
                name: fallback.full_name,
                class: fallback.class,
                balance: fallback.balance || 0,
              },
            })
          );

          setTimeout(() => {
            console.log("Redirecting student to /portal/dashboard");
            router.push("/portal/dashboard");
          }, 800);
          return;
        }
      }

      console.log("❌ No matching credentials found");
      setError("Invalid credentials.");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("An error occurred.");
    } finally {
      setLoading(false);
      console.log("=== LOGIN ATTEMPT END ===");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft
              size={16}
              className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:-translate-x-1"
            />
            <span className="text-xs font-black uppercase text-slate-600">
              Back
            </span>
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest mb-6 shadow-lg">
            <Sparkles size={16} /> Portal <Sparkles size={16} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
            Secure{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Access
            </span>
          </h1>
          <p className="text-slate-600 text-sm font-medium">
            Authentication required
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white relative">
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Shield size={12} /> Secure
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <GraduationCap size={12} /> Identifier
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 transition-all"
                    placeholder=""
                    autoComplete="username"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-blue-50 rounded-lg">
                    <GraduationCap size={18} className="text-blue-600" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Lock size={12} /> Credential
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 transition-all"
                    placeholder=""
                    required
                    autoComplete="current-password"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-blue-50 rounded-lg">
                    <Lock size={18} className="text-blue-600" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-4">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Authenticate"
              )}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Shield size={12} /> <span>Secure Portal</span>
            </div>
            <div className="flex items-center gap-2">
              <Building size={12} /> <span>Detema Secondary</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StealthPortalLogin;