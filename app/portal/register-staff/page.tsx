// app/portal/teacher/page.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  PlusCircle, ShieldAlert, Loader2, LogOut, 
  ShieldCheck, RefreshCw, Mail, Lock, User, 
  CheckCircle2, ArrowRight, Smartphone, Calendar,
  BookOpen, Eye, EyeOff, AlertCircle, IdCard,
  Clock, Info, ExternalLink, Briefcase, MapPin,
  Building2, VenusAndMars, ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schemas
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const registrationSchema = z.object({
  ec_number: z.string()
    .min(6, 'EC Number must be at least 6 characters')
    .regex(/^[A-Z0-9]+$/, 'EC Number can only contain letters and numbers'),
  email_address: z.string().email('Invalid email address'),
  password: passwordSchema,
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  contact_number: z.string()
    .transform((val) => val.replace(/\D/g, ''))
    .pipe(
      z.string()
        .regex(/^0(7[1-9]|8[0-9]|9[0-9]|4[0-9]|5[0-9])\d{7}$/, 'Invalid Zimbabwean phone number')
        .length(10, 'Phone number must be 10 digits')
    ),
  designation: z.string().min(1, 'Please select a designation'),
  department: z.string().min(1, 'Please select a department'),
  subject_taught: z.string().min(1, 'Please select a subject'),
  gender: z.string().min(1, 'Please select gender'),
});

const designations = [
  'HEAD',
  'DEPUTY',
  'SR TEACHER',
  'TEACHER',
  'NON-TEACHING STAFF',
  'ADMINISTRATOR',
  'SUPPORT STAFF'
];

const departments = [
  'SCIENCE DEPARTMENT',
  'MATHEMATICS DEPARTMENT',
  'LANGUAGES DEPARTMENT',
  'HUMANITIES DEPARTMENT',
  'COMMERCIAL DEPARTMENT',
  'TECHNICAL DEPARTMENT',
  'SPORTS DEPARTMENT',
  'ADMINISTRATION',
  'SUPPORT SERVICES'
];

const subjects = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Geography',
  'Business Studies',
  'Art & Design',
  'Physical Education',
  'General Academic',
  'Textile Technology & Design',
  'Metal Technology & Design',
  'Heritage Studies',
  'PESMD',
  'Shona',
  'Ndebele',
  'Accounts',
  'Economics',
  'Commerce',
  'Principles of Accounts',
  'Integrated Science',
  'Agriculture',
  'Religious Studies',
  'Fashion & Fabrics',
  'Wood Technology',
  'Technical Graphics',
  'Food & Nutrition'
];

const genderOptions = ['M', 'F'];

export default function StaffSignUpPortal() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [registrationTime, setRegistrationTime] = useState<string>('');
  const [masterData, setMasterData] = useState<any>(null);
  const [showMasterData, setShowMasterData] = useState(false);
  
  // currentStep 1: Entry, 2: EC Verification, 3: Registration, 4: Pending/Approval Check
  const [currentStep, setCurrentStep] = useState(1);
  
  const [regData, setRegData] = useState({
    ec_number: '',
    email_address: '',
    password: '',
    full_name: '',
    contact_number: '',
    designation: '',
    department: 'SCIENCE DEPARTMENT',
    subject_taught: 'Mathematics',
    gender: 'M',
  });

  const hasCheckedAuth = useRef(false);
  const [isClient, setIsClient] = useState(false);

  // Format phone number as user types - Zimbabwean format
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Validate form data
  const validateForm = () => {
    try {
      registrationSchema.parse(regData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Check if EC number exists in master list (for verification only)
  const checkECNumber = async () => {
    if (!regData.ec_number.trim()) {
      toast.error('Please enter EC Number');
      return;
    }

    setIsActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_master_list')
        .select('*')
        .eq('ec_number', regData.ec_number.trim().toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('EC Number not found in master list. Please verify with administration.');
          return;
        }
        throw error;
      }

      if (data) {
        setMasterData(data);
        setShowMasterData(true);
        
        // Auto-populate form with master data for verification
        // But allow staff to override contact info
        setRegData(prev => ({
          ...prev,
          full_name: data.full_name || '',
          designation: data.designation || '',
          gender: data.gender || 'M',
          subject_taught: data.subject_taught || prev.subject_taught
        }));
        
        toast.success('EC Number verified! Please complete your registration.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify EC Number');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Check approval status
  const checkApprovalStatus = useCallback(async (isManualCheck = false) => {
    if (isManualCheck) setIsActionLoading(true);
    else setIsLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        if (userError.message.includes('Auth session missing')) {
          console.log('No active session');
          setIsLoading(false);
          setIsActionLoading(false);
          return;
        }
        throw userError;
      }
      
      if (!user) {
        setIsLoading(false);
        setIsActionLoading(false);
        return;
      }

      const { data: prof, error: profileError } = await supabase
        .from('staff_profiles')
        .select('*, created_at')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          await supabase.auth.signOut();
          return;
        }
        throw profileError;
      }
      
      if (prof) {
        setProfile(prof);
        
        if (prof.created_at) {
          const regDate = new Date(prof.created_at);
          setRegistrationTime(regDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }));
        }
        
        if (prof.is_approved) {
          toast.success('Account approved! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/portal/teacher/dashboard');
          }, 1500);
        } else {
          setCurrentStep(4);
          if (isManualCheck) {
            toast('Still pending approval', {
              icon: '⏳',
              duration: 3000
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Sync Error:', err);
      if (!err.message?.includes('Auth session missing')) {
        toast.error(err.message || 'Failed to check status');
      }
    } finally {
      setIsLoading(false);
      setIsActionLoading(false);
    }
  }, [router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    checkApprovalStatus();
  }, [checkApprovalStatus, isClient]);

  const handleInputChange = (field: keyof typeof regData, value: string) => {
    setRegData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('contact_number', formatted);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }
    
    setIsActionLoading(true);
    setErrors({});

    try {
      // Check if EC number already registered in staff_profiles
      const { data: existingEC } = await supabase
        .from('staff_profiles')
        .select('ec_number')
        .eq('ec_number', regData.ec_number.trim().toUpperCase());

      if (existingEC && existingEC.length > 0) {
        throw new Error('EC Number already registered');
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('staff_profiles')
        .select('email_address')
        .eq('email_address', regData.email_address);

      if (existingEmail && existingEmail.length > 0) {
        throw new Error('Email already registered');
      }

      // 1. SIGN UP with Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regData.email_address,
        password: regData.password,
        options: {
          data: {
            full_name: regData.full_name,
            ec_number: regData.ec_number,
            user_type: 'staff'
          },
          emailRedirectTo: `${window.location.origin}/portal/teacher`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Auto sign-in for session
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: regData.email_address,
          password: regData.password
        });
        
        if (signInError) {
          console.warn('Auto-signin failed:', signInError);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 2. Create staff profile ONLY (do NOT update master list)
        const { error: profileError } = await supabase
          .from('staff_profiles')
          .insert([{
            id: authData.user.id,
            ec_number: regData.ec_number.trim().toUpperCase(),
            full_name: regData.full_name,
            email_address: regData.email_address,
            contact_number: regData.contact_number.replace(/\D/g, ''),
            designation: regData.designation,
            department: regData.department,
            subject_taught: regData.subject_taught,
            gender: regData.gender,
            is_approved: false,
            is_active: false,
            status: 'pending',
            registration_ip: await getClientIP(),
            last_status_check: new Date().toISOString()
          }]);

        if (profileError) {
          console.error('Profile insert error:', profileError);
          throw profileError;
        }
        
        toast.success('Account created successfully! Awaiting admin approval.');
        
        setRegistrationTime(new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }));
        
        setProfile({ 
          ec_number: regData.ec_number,
          full_name: regData.full_name, 
          email_address: regData.email_address,
          designation: regData.designation,
          department: regData.department,
          subject_taught: regData.subject_taught,
          gender: regData.gender,
          is_approved: false 
        });
        
        setTimeout(() => {
          setCurrentStep(4);
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      toast.error(errorMessage);
      setErrors({ form: errorMessage });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setCurrentStep(1);
      setRegData({
        ec_number: '',
        email_address: '',
        password: '',
        full_name: '',
        contact_number: '',
        designation: '',
        department: 'SCIENCE DEPARTMENT',
        subject_taught: 'Mathematics',
        gender: 'M',
      });
      toast.success('Signed out successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const passwordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
          <p className="mt-4 text-slate-600 font-semibold">Initializing...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
          <p className="mt-4 text-slate-600 font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // STEP 1: INITIAL CHOICE
  if (currentStep === 1) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-10 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ShieldCheck className="text-white" size={48} />
            </div>
            <h1 className="text-6xl font-black italic uppercase text-slate-900 leading-none">
              Staff <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Portal</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.2em] mt-4">
              Detema Secondary School Management
            </p>
          </div>
          
          <div className="grid gap-6 w-full max-w-md animate-slide-up">
            <button 
              onClick={() => setCurrentStep(2)}
              className="group bg-gradient-to-r from-slate-900 to-blue-900 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-widest hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform hover:-translate-y-1"
            >
              <PlusCircle size={22} />
              Register New Account
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
            
            <button 
              onClick={() => router.push('/portal/login')}
              className="bg-white text-slate-700 py-7 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-blue-50 transition-all duration-300 border-2 border-slate-200 hover:border-blue-300 shadow-lg hover:shadow-xl group"
            >
              <span className="flex items-center justify-center gap-3">
                <LogOut size={20} className="group-hover:rotate-180 transition-transform" />
                Login Existing Account
              </span>
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <IdCard className="text-blue-600" size={24} />
              </div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">EC Verification</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="text-emerald-600" size={24} />
              </div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Admin Approval</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="text-purple-600" size={24} />
              </div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Teaching Tools</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // STEP 2: EC VERIFICATION
  if (currentStep === 2) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-2xl w-full animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase italic text-slate-900 leading-none">
                  EC <span className="text-blue-600">Verification</span>
                </h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">
                  Enter your Employment Code (EC) Number
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider"
              >
                ← Back
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                  <IdCard className="inline mr-2" size={14} />
                  EC Number (from staff establishment form)
                </label>
                <input
                  required
                  placeholder="0871293G"
                  value={regData.ec_number}
                  onChange={(e) => handleInputChange('ec_number', e.target.value.toUpperCase())}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-slate-100 focus:border-blue-500 transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Enter your EC Number exactly as it appears on your employment documents
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={checkECNumber}
                  disabled={isActionLoading || !regData.ec_number.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:shadow-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Verify EC Number
                    </>
                  )}
                </button>
              </div>
              
              {showMasterData && masterData && (
                <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="text-emerald-600" size={24} />
                    <h3 className="text-lg font-bold text-emerald-800">EC Number Verified</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs font-black text-emerald-600 uppercase">Full Name</p>
                      <p className="font-bold text-slate-900">{masterData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-600 uppercase">Designation</p>
                      <p className="font-bold text-slate-900">{masterData.designation}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-600 uppercase">Gender</p>
                      <p className="font-bold text-slate-900">{masterData.gender === 'M' ? 'Male' : 'Female'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-600 uppercase">Appointment Date</p>
                      <p className="font-bold text-slate-900">{masterData.date_of_appointment}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
                  >
                    Continue Registration
                  </button>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 rounded-2xl">
                <p className="text-xs text-blue-700">
                  <Info className="inline mr-2" size={14} />
                  Your EC Number must match the official staff establishment records. 
                  If you cannot find your EC Number, please contact the school administration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // STEP 3: REGISTRATION FORM
  if (currentStep === 3) {
    const pwdStrength = passwordStrength(regData.password);
    
    return (
      <>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-3xl w-full animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase italic text-slate-900 leading-none">
                  Staff <span className="text-blue-600">Registration</span>
                </h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">
                  Complete your profile to request access
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider"
              >
                ← Back
              </button>
            </div>
            
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* EC Number (readonly) */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                    <IdCard className="inline mr-2" size={14} />
                    EC Number
                  </label>
                  <input
                    readOnly
                    value={regData.ec_number}
                    className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold text-sm border-2 border-slate-200"
                  />
                </div>
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                    <User className="inline mr-2" size={14} />
                    Full Name
                  </label>
                  <input
                    readOnly
                    value={regData.full_name}
                    className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold text-sm border-2 border-slate-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">From master list (cannot be changed)</p>
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                    <Mail className="inline mr-2" size={14} />
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="teacher@detema.edu"
                    value={regData.email_address}
                    onChange={(e) => handleInputChange('email_address', e.target.value)}
                    className={`w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 transition-all ${
                      errors.email_address 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.email_address && (
                    <p className="mt-2 text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.email_address}
                    </p>
                  )}
                </div>
                
                {/* Phone */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                    <Smartphone className="inline mr-2" size={14} />
                    Contact Number *
                  </label>
                  <input
                    required
                    placeholder="077-123-4567"
                    value={regData.contact_number}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 transition-all ${
                      errors.contact_number 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.contact_number && (
                    <p className="mt-2 text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.contact_number}
                    </p>
                  )}
                </div>
                
                {/* Designation */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                    <Briefcase className="inline mr-2" size={14} />
                    Designation
                  </label>
                  <input
                    readOnly
                    value={regData.designation}
                    className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold text-sm border-2 border-slate-200"
                  />
                </div>
                
                {/* Department */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                    <Building2 className="inline mr-2" size={14} />
                    Department *
                  </label>
                  <select
                    required
                    value={regData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 transition-all ${
                      errors.department 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-100 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-2 text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.department}
                    </p>
                  )}
                </div>
                
                {/* Subject Taught */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                    <BookOpen className="inline mr-2" size={14} />
                    Primary Subject *
                  </label>
                  <select
                    required
                    value={regData.subject_taught}
                    onChange={(e) => handleInputChange('subject_taught', e.target.value)}
                    className={`w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 transition-all ${
                      errors.subject_taught 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-100 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  {errors.subject_taught && (
                    <p className="mt-2 text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.subject_taught}
                    </p>
                  )}
                </div>
                
                {/* Gender */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                    <VenusAndMars className="inline mr-2" size={14} />
                    Gender
                  </label>
                  <input
                    readOnly
                    value={regData.gender === 'M' ? 'Male' : 'Female'}
                    className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold text-sm border-2 border-slate-200"
                  />
                </div>
                
                {/* Password */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                    <Lock className="inline mr-2" size={14} />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={regData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 transition-all pr-12 ${
                        errors.password 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-slate-100 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {regData.password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className={`h-2 flex-1 rounded-full transition-all ${
                              index < pwdStrength 
                                ? strengthColors[pwdStrength - 1] 
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-slate-600">
                        Strength: <span className={pwdStrength >= 3 ? 'text-green-600' : 'text-orange-600'}>
                          {strengthLabels[pwdStrength - 1] || 'Very Weak'}
                        </span>
                      </p>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="mt-2 text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.password}
                    </p>
                  )}
                  
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Requirements:</p>
                    <ul className="text-[10px] text-slate-500 space-y-1">
                      <li className={`flex items-center gap-1 ${regData.password.length >= 8 ? 'text-green-600' : ''}`}>
                        {regData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={`flex items-center gap-1 ${/[A-Z]/.test(regData.password) ? 'text-green-600' : ''}`}>
                        {/[A-Z]/.test(regData.password) ? '✓' : '○'} One uppercase letter
                      </li>
                      <li className={`flex items-center gap-1 ${/[0-9]/.test(regData.password) ? 'text-green-600' : ''}`}>
                        {/[0-9]/.test(regData.password) ? '✓' : '○'} One number
                      </li>
                      <li className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(regData.password) ? 'text-green-600' : ''}`}>
                        {/[^A-Za-z0-9]/.test(regData.password) ? '✓' : '○'} One special character
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
                <Info className="text-blue-600 mt-0.5" size={16} />
                <p className="text-xs text-slate-700">
                  Fields marked with * are required. Your EC Number, Name, Designation, and Gender are 
                  verified against the official master list and cannot be changed. 
                  After registration, your account requires administrative approval. 
                  You will be notified via email once activated.
                </p>
              </div>
              
              {errors.form && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-600 text-sm font-bold flex items-center gap-2">
                    <AlertCircle size={16} />
                    {errors.form}
                  </p>
                </div>
              )}
              
              <button
                disabled={isActionLoading}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:shadow-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Submit Registration Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // STEP 4: PENDING APPROVAL
  if (currentStep === 4) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-lg w-full animate-fade-in">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-3xl -mt-4 mb-8 text-center shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 size={20} />
                <span className="text-sm font-black uppercase tracking-widest">
                  Registration Successful
                </span>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <ShieldAlert className="text-amber-600" size={64} />
              </div>
              
              <h1 className="text-3xl font-black uppercase italic mb-4 text-slate-900">
                Awaiting <span className="text-amber-600">Approval</span>
              </h1>
              
              <p className="text-slate-600 text-sm leading-relaxed mb-8">
                Your account has been created successfully and is now pending administrative review. 
                You will receive an email notification once your account is activated.
              </p>
              
              {/* Profile Card */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-3xl mb-8 border border-slate-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-500 uppercase">EC Number</p>
                      <p className="font-mono font-bold text-slate-900">{profile?.ec_number}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase animate-pulse">
                        <Clock size={12} />
                        Pending
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-500 uppercase">Full Name</p>
                    <p className="font-bold text-slate-900">{profile?.full_name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-500 uppercase">Designation</p>
                      <p className="text-sm font-semibold text-slate-700">{profile?.designation}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-500 uppercase">Department</p>
                      <p className="text-sm font-semibold text-slate-700">{profile?.department}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-500 uppercase">Email</p>
                      <p className="text-sm font-semibold text-slate-700">{profile?.email_address}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-500 uppercase">Subject</p>
                      <p className="text-sm font-semibold text-slate-700">{profile?.subject_taught}</p>
                    </div>
                  </div>
                  
                  {registrationTime && (
                    <div className="text-left pt-4 border-t border-slate-200">
                      <p className="text-xs font-black text-slate-500 uppercase">Registration Date</p>
                      <p className="text-sm text-slate-600">{registrationTime}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => checkApprovalStatus(true)}
                  disabled={isActionLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg shadow-blue-100 hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isActionLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Checking Status...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Check Approval Status
                    </>
                  )}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleLogout}
                    className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-slate-700 to-slate-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:from-slate-800 hover:to-slate-950 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refresh Page
                  </button>
                </div>
              </div>
              
              {/* Help Text */}
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-xs text-amber-800 text-center">
                  <Info className="inline mr-2" size={14} />
                  For urgent approval requests, please contact the school administrator directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}