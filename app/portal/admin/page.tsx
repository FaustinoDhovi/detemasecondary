// app/admin/page.tsx
"use client";

export const dynamic = 'force-dynamic';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Loader2, CheckCircle2, Search, ShieldAlert, LogOut, 
  XCircle, Archive, Users, Plus, ShieldCheck, 
  UserPlus, TrendingUp, Mail, Trash2, 
  Filter, Download, BarChart3, Fingerprint, RefreshCcw,
  ChevronRight, ArrowUpRight, ArrowDownRight, Database, AlertTriangle,
  FileText, Eye, Edit, CreditCard, Calendar, Lock, Unlock, Bell,
  BookOpen, GraduationCap, Clock, Award, User, Home, Phone, DollarSign,
  Bookmark, ChevronLeft, MoreVertical, FileEdit, PieChart, Target,
  Activity, TrendingDown, CheckSquare, XSquare, AlertCircle,
  Building2, Briefcase, IdCard, VenusAndMars, Link, Unlink,
  School, Calculator, BarChart4, Shield, FileSpreadsheet,
  Printer, Send, Settings, DatabaseZap, AlertOctagon,
  Percent, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
  DollarSign as DollarSignIcon, CreditCard as CreditCardIcon,
  Users as UsersIcon, UserCheck, UserX, UserMinus, UserPlus as UserPlusIcon,
  FolderArchive, FileUp, FileDown, ClipboardList, Receipt,
  BellRing, MessageSquare, PhoneCall, Mail as MailIcon,
  CalendarDays, CalendarCheck, CalendarX, CalendarClock,
  Target as TargetIcon, Trophy, Award as AwardIcon, Star,
  Book as BookIcon, BookOpen as BookOpenIcon, Bookmark as BookmarkIcon,
  School as SchoolIcon, GraduationCap as GraduationCapIcon,
  Clock as ClockIcon, Calendar as CalendarIcon, AlertCircle as AlertCircleIcon,
  HelpCircle, Info as InfoIcon, Settings as SettingsIcon,
  Filter as FilterIcon, Download as DownloadIcon, Upload,
  MoreHorizontal, ExternalLink, Maximize2, Minimize2,
  ChevronUp, ChevronDown, ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon, MoveRight, MoveLeft,
  Grid, List, LayoutDashboard, Table, Columns,
  Type, Hash, Hash as HashIcon, Tag, AtSign,
  Percent as PercentIcon, Divide, Plus as PlusIcon,
  Minus, Divide as DivideIcon, Check, X, Zap, Battery, BatteryCharging,
  Wifi, WifiOff, Server, HardDrive, Cpu,
  Database as DatabaseIcon, Cloud, CloudOff,
  Shield as ShieldIcon, ShieldOff, Key, KeyRound,
  Lock as LockIcon, Unlock as UnlockIcon, Eye as EyeIcon,
  EyeOff as EyeOffIcon, QrCode, Scan, ScanFace,
  Fingerprint as FingerprintIcon,
  Tablet, Laptop, Monitor,
  Printer as PrinterIcon, Camera,
  Video, Mic, Headphones, Speaker, Volume2,
  Bell as BellIcon, BellRing as BellRingIcon, BellOff,
  Megaphone, MegaphoneOff, Radio, Satellite,
  Wrench, Hammer, Cog, Cog as CogIcon,
  Settings2, Sliders, ToggleLeft, ToggleRight,
  ToggleLeft as ToggleLeftIcon, ToggleRight as ToggleRightIcon,
  Power, PowerOff, Zap as ZapIcon, Battery as BatteryIcon,
  Thermometer, Droplets, Wind, Sun, Moon,
  Cloud as CloudIcon, CloudRain, CloudSnow, CloudLightning,
  Umbrella, Snowflake, Sunrise, Sunset
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

// Types
interface Student {
  id: string;
  name: string;
  student_class: string;
  amount_owing: number | string;
  term_3_2025: number | string;
  jan_2025: number | string;
  term_1_2026: number | string;
  term_2_2026: number | string;
  term_3_2026: number | string;
  total_fees: number | string;
  total_paid: number | string;
  total_balance: number | string;
  parent_contact: string;
  email: string;
  status?: 'active' | 'completed' | 'inactive';
  payment_type?: 'beam' | 'solon' | 'direct' | 'other';
  date_of_birth?: string;
  address?: string;
  parent_name?: string;
  emergency_contact?: string;
  enrollment_date?: string;
  notes?: string;
  candidate_number?: string;
}

interface Staff {
  id: string;
  ec_number: string;
  full_name: string;
  designation: string;
  contact_number: string;
  email_address: string;
  gender: string;
  is_active: boolean;
  department: string;
  subject_taught?: string;
  date_of_appointment?: string;
  date_of_birth?: string;
  province?: string;
  district?: string;
  station?: string;
}

interface PendingStaff {
  id: string;
  ec_number: string;
  full_name: string;
  designation: string;
  contact_number: string;
  email_address: string;
  gender: string;
  is_approved: boolean;
  department: string;
  subject_taught?: string;
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
}

interface Analytics {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  totalRevenue: number;
  totalArrears: number;
  collectionRate: string;
  beamStudents: number;
  solonStudents: number;
  directPayStudents: number;
  otherStudents: number;
  beamArrears: number;
  solonArrears: number;
  directPayArrears: number;
  otherArrears: number;
  averageArrears: number;
  totalFees: number;
  totalPaid: number;
}

interface FinancialSummary {
  totalFees: number;
  totalPaid: number;
  totalBalance: number;
  beamTotal: number;
  solonTotal: number;
  directPayTotal: number;
  otherTotal: number;
  beamPaid: number;
  solonPaid: number;
  directPayPaid: number;
  otherPaid: number;
  beamBalance: number;
  solonBalance: number;
  directPayBalance: number;
  otherBalance: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Helper function to extract numeric value
const extractNumericValue = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    const cleanString = value.replace(/[^\d.-]/g, '');
    const numericValue = parseFloat(cleanString);
    return isNaN(numericValue) ? 0 : numericValue;
  }
  
  return 0;
};

// Determine student type based on amount_owing value
const determinePaymentType = (student: Student): 'beam' | 'solon' | 'direct' | 'other' => {
  const amountOwing = student.amount_owing?.toString().toLowerCase() || '';
  
  if (amountOwing.includes('beam')) return 'beam';
  if (amountOwing.includes('solon')) return 'solon';
  
  // Check if it's a direct payment (numeric value)
  const numericValue = extractNumericValue(student.amount_owing);
  if (numericValue > 0 && !isNaN(numericValue)) return 'direct';
  
  return 'other';
};

// Check if student has completed studies (ID contains 2022)
const isCompletedStudent = (studentId: string): boolean => {
  return studentId.includes('2022');
};

// Determine student status
const determineStudentStatus = (student: Student): 'active' | 'completed' | 'inactive' => {
  if (isCompletedStudent(student.id)) return 'completed';
  return 'active';
};

// Calculate student fees - ALL active students owe $70 for Term 1 2026
const calculateStudentFees = (student: Student) => {
  const isCompleted = isCompletedStudent(student.id);
  
  if (isCompleted) {
    // Completed students don't get billed
    return {
      totalFees: 0,
      totalPaid: 0,
      totalBalance: 0,
      term1_2026: 0
    };
  }
  
  // Active students owe $70 for Term 1 2026
  const term1_2026 = 70;
  const totalPaid = extractNumericValue(student.total_paid);
  const totalFees = term1_2026;
  const totalBalance = Math.max(0, totalFees - totalPaid);
  
  return {
    totalFees,
    totalPaid,
    totalBalance,
    term1_2026
  };
};

export default function MasterAdminTerminal() {
  const [students, setStudents] = useState<Student[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [pendingStaff, setPendingStaff] = useState<PendingStaff[]>([]);
  const [approvedStaff, setApprovedStaff] = useState<Staff[]>([]);
  const [view, setView] = useState<'overview' | 'finance' | 'students' | 'staff' | 'reports' | 'settings' | 'student_details'>('overview');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterPaymentType, setFilterPaymentType] = useState<"all" | "beam" | "solon" | "direct" | "other">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'warning', msg: string} | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'arrears' | 'paid'>('all');
  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_method: 'cash',
    description: ''
  });
  const [importModal, setImportModal] = useState(false);
  const [editStudentModal, setEditStudentModal] = useState(false);
  const [editStudentData, setEditStudentData] = useState<Partial<Student>>({});
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    student_class: '',
    amount_owing: '',
    parent_contact: '',
    email: '',
    candidate_number: '',
    payment_type: 'direct' as 'beam' | 'solon' | 'direct' | 'other'
  });
  
  const router = useRouter();
  const hasCheckedAuth = useRef(false);
  const hasRedirected = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate analytics
  const analytics: Analytics = useMemo(() => {
    let totalStudents = 0;
    let activeStudents = 0;
    let completedStudents = 0;
    let totalRevenue = 0;
    let totalArrears = 0;
    let totalFees = 0;
    let totalPaid = 0;
    
    const typeCounts = {
      beam: 0,
      solon: 0,
      direct: 0,
      other: 0
    };
    
    const typeArrears = {
      beam: 0,
      solon: 0,
      direct: 0,
      other: 0
    };

    students.forEach(s => {
      const isCompleted = isCompletedStudent(s.id);
      const paymentType = determinePaymentType(s);
      const fees = calculateStudentFees(s);
      
      totalStudents++;
      totalFees += fees.totalFees;
      totalPaid += fees.totalPaid;
      
      if (isCompleted) {
        completedStudents++;
      } else {
        activeStudents++;
        totalRevenue += fees.totalPaid;
        totalArrears += fees.totalBalance;
        
        typeCounts[paymentType]++;
        typeArrears[paymentType] += fees.totalBalance;
      }
    });

    const collectionRate = totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(1) : "0";
    const averageArrears = activeStudents > 0 ? totalArrears / activeStudents : 0;

    return {
      totalStudents,
      activeStudents,
      completedStudents,
      totalRevenue,
      totalArrears,
      collectionRate,
      beamStudents: typeCounts.beam,
      solonStudents: typeCounts.solon,
      directPayStudents: typeCounts.direct,
      otherStudents: typeCounts.other,
      beamArrears: typeArrears.beam,
      solonArrears: typeArrears.solon,
      directPayArrears: typeArrears.direct,
      otherArrears: typeArrears.other,
      averageArrears,
      totalFees,
      totalPaid
    };
  }, [students]);

  // Financial summary by payment type
  const financialSummary: FinancialSummary = useMemo(() => {
    const summary = {
      totalFees: 0,
      totalPaid: 0,
      totalBalance: 0,
      beamTotal: 0,
      solonTotal: 0,
      directPayTotal: 0,
      otherTotal: 0,
      beamPaid: 0,
      solonPaid: 0,
      directPayPaid: 0,
      otherPaid: 0,
      beamBalance: 0,
      solonBalance: 0,
      directPayBalance: 0,
      otherBalance: 0
    };

    students.forEach(s => {
      const isCompleted = isCompletedStudent(s.id);
      if (isCompleted) return;
      
      const paymentType = determinePaymentType(s);
      const fees = calculateStudentFees(s);
      
      summary.totalFees += fees.totalFees;
      summary.totalPaid += fees.totalPaid;
      summary.totalBalance += fees.totalBalance;
      
      switch(paymentType) {
        case 'beam':
          summary.beamTotal += fees.totalFees;
          summary.beamPaid += fees.totalPaid;
          summary.beamBalance += fees.totalBalance;
          break;
        case 'solon':
          summary.solonTotal += fees.totalFees;
          summary.solonPaid += fees.totalPaid;
          summary.solonBalance += fees.totalBalance;
          break;
        case 'direct':
          summary.directPayTotal += fees.totalFees;
          summary.directPayPaid += fees.totalPaid;
          summary.directPayBalance += fees.totalBalance;
          break;
        case 'other':
          summary.otherTotal += fees.totalFees;
          summary.otherPaid += fees.totalPaid;
          summary.otherBalance += fees.totalBalance;
          break;
      }
    });

    return summary;
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parent_contact?.includes(searchTerm) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.candidate_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = filterClass === "All" || s.student_class === filterClass;
      
      const paymentType = determinePaymentType(s);
      const matchesPaymentType = filterPaymentType === "all" || paymentType === filterPaymentType;
      
      const studentStatus = determineStudentStatus(s);
      const matchesStatus = filterStatus === "all" || studentStatus === filterStatus;
      
      const fees = calculateStudentFees(s);
      const matchesTab = 
        activeTab === 'all' ? true :
        activeTab === 'arrears' ? fees.totalBalance > 0 :
        activeTab === 'paid' ? fees.totalBalance <= 0 : true;
      
      return matchesSearch && matchesClass && matchesPaymentType && matchesStatus && matchesTab;
    });
  }, [students, searchTerm, filterClass, filterPaymentType, filterStatus, activeTab]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    console.log("🔄 Fetching all data...");
    setLoading('fetching');
    try {
      const [
        studentsRes,
        staffMasterRes,
        pendingStaffRes,
        approvedStaffRes
      ] = await Promise.all([
        supabase.from('student_ledger').select('*').order('name', { ascending: true }),
        supabase.from('staff_master_list').select('*').order('full_name', { ascending: true }),
        supabase.from('staff_profiles').select('*').eq('is_approved', false).order('created_at', { ascending: false }),
        supabase.from('staff_profiles').select('*').eq('is_approved', true).order('full_name', { ascending: true })
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (staffMasterRes.data) setAllStaff(staffMasterRes.data);
      if (pendingStaffRes.data) setPendingStaff(pendingStaffRes.data);
      if (approvedStaffRes.data) setApprovedStaff(approvedStaffRes.data);

      setStatus({ type: 'success', msg: "Data refreshed successfully" });
    } catch (err) {
      console.error("Critical System Fetch Error", err);
      setStatus({ type: 'error', msg: "Failed to fetch data" });
    } finally {
      setLoading(null);
    }
  }, []);

  // Bulk bill all active students
  const handleBulkBillStudents = async () => {
    if (!confirm("This will bill ALL active students $70 for Term 1 2026. Continue?")) return;
    
    setLoading('bulk-bill');
    try {
      const updates = students.map(s => {
        const isCompleted = isCompletedStudent(s.id);
        if (isCompleted) return null;
        
        return {
          id: s.id,
          term_1_2026: 70,
          total_fees: (extractNumericValue(s.total_fees) || 0) + 70,
          total_balance: (extractNumericValue(s.total_balance) || 0) + 70,
          updated_at: new Date().toISOString()
        };
      }).filter(Boolean);

      // Update in batches
      const batchSize = 50;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const { error } = await supabase
          .from('student_ledger')
          .upsert(batch);
        
        if (error) throw error;
      }

      setStatus({ type: 'success', msg: `Billed ${updates.length} active students $70 each for Term 1 2026` });
      fetchData();
    } catch (err: any) {
      console.error('Bulk bill error:', err);
      setStatus({ type: 'error', msg: "Failed to bill students: " + err.message });
    } finally {
      setLoading(null);
    }
  };

  // Handle student selection
  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const selectAllFiltered = () => {
    const allIds = new Set(filteredStudents.map(s => s.id));
    setSelectedStudents(allIds);
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  // Bulk actions
  const handleBulkSendReminders = async () => {
    if (selectedStudents.size === 0) {
      setStatus({ type: 'error', msg: "Please select at least one student" });
      return;
    }

    setLoading('bulk-reminders');
    try {
      const selectedStudentsData = students.filter(s => selectedStudents.has(s.id));
      const arrearsStudents = selectedStudentsData.filter(s => {
        const fees = calculateStudentFees(s);
        return fees.totalBalance > 0;
      });
      
      if (arrearsStudents.length === 0) {
        setStatus({ type: 'warning', msg: "Selected students have no arrears" });
        return;
      }

      // Simulate sending reminders
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus({ 
        type: 'success', 
        msg: `Payment reminders sent to ${arrearsStudents.length} parent(s) with arrears` 
      });
      setBulkActionModal(false);
      clearSelection();
    } catch (error) {
      setStatus({ type: 'error', msg: "Failed to send reminders" });
    } finally {
      setLoading(null);
    }
  };

  // Add payment
  const handleAddPayment = async () => {
    if (!selectedStudent || !newPayment.amount) {
      setStatus({ type: 'error', msg: "Please enter payment amount" });
      return;
    }

    setLoading('adding-payment');
    try {
      const paymentAmount = parseFloat(newPayment.amount);
      const currentPaid = extractNumericValue(selectedStudent.total_paid);
      const currentBalance = extractNumericValue(selectedStudent.total_balance);
      
      const updateData = {
        total_paid: currentPaid + paymentAmount,
        total_balance: Math.max(0, currentBalance - paymentAmount),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('student_ledger')
        .update(updateData)
        .eq('id', selectedStudent.id);

      if (error) throw error;

      // Record payment in payments table if exists
      const paymentData = {
        student_id: selectedStudent.id,
        amount: paymentAmount,
        payment_date: new Date().toISOString(),
        payment_method: newPayment.payment_method,
        received_by: 'MASTER_ADMIN',
        description: newPayment.description,
        reference_number: `PMT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      try {
        await supabase.from('student_payments').insert(paymentData);
      } catch (err) {
        console.log('Payment recording optional');
      }

      setStatus({ type: 'success', msg: `Payment of $${paymentAmount.toLocaleString()} recorded successfully` });
      setPaymentModal(false);
      setNewPayment({
        amount: '',
        payment_method: 'cash',
        description: ''
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Payment error:', error);
      setStatus({ type: 'error', msg: "Failed to record payment: " + error.message });
    } finally {
      setLoading(null);
    }
  };

  // Add new student
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.student_class) {
      setStatus({ type: 'error', msg: "Please fill in required fields" });
      return;
    }

    setLoading('adding-student');
    try {
      // Generate student ID
      const currentYear = new Date().getFullYear();
      const randomId = Math.random().toString(36).substr(2, 8).toUpperCase();
      const studentId = `DET-${currentYear}-${randomId}`;
      
      // Check if candidate number indicates completed student
      const isCompleted = newStudent.candidate_number?.includes('2022') || false;
      
      const studentData = {
        ...newStudent,
        id: studentId,
        amount_owing: newStudent.payment_type === 'direct' ? '70' : newStudent.amount_owing,
        term_1_2026: isCompleted ? 0 : 70,
        term_2_2026: 0,
        term_3_2026: 0,
        total_fees: isCompleted ? 0 : 70,
        total_paid: 0,
        total_balance: isCompleted ? 0 : 70,
        status: isCompleted ? 'completed' : 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('student_ledger').insert(studentData);
      if (error) throw error;

      setStatus({ type: 'success', msg: `Student ${newStudent.name} added successfully` });
      setAddStudentModal(false);
      setNewStudent({
        name: '',
        student_class: '',
        amount_owing: '',
        parent_contact: '',
        email: '',
        candidate_number: '',
        payment_type: 'direct'
      });
      fetchData();
    } catch (error: any) {
      setStatus({ type: 'error', msg: "Failed to add student: " + error.message });
    } finally {
      setLoading(null);
    }
  };

  // Edit student
  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setEditStudentData({ ...student });
    setEditStudentModal(true);
  };

  const handleSaveEditStudent = async () => {
    if (!studentToEdit || !editStudentData.name) return;
    
    setLoading('saving-student');
    try {
      const updateData = {
        ...editStudentData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('student_ledger')
        .update(updateData)
        .eq('id', studentToEdit.id);
      
      if (error) throw error;
      
      setStatus({ type: 'success', msg: "Student record updated successfully" });
      setEditStudentModal(false);
      setStudentToEdit(null);
      fetchData();
    } catch (error: any) {
      setStatus({ type: 'error', msg: `Update failed: ${error.message}` });
    } finally {
      setLoading(null);
    }
  };

  // Staff approval
  const handleApproveStaff = async (staffId: string) => {
    console.log("✅ Approving staff:", staffId);
    setLoading(`approve-${staffId}`);
    try {
      const staffToApprove = pendingStaff.find(s => s.id === staffId);
      if (!staffToApprove) throw new Error('Staff not found');
      
      const { error: profileError } = await supabase
        .from('staff_profiles')
        .update({ 
          is_approved: true,
          is_active: true,
          approved_at: new Date().toISOString(),
          approved_by: 'MASTER_ADMIN'
        })
        .eq('id', staffId);
      
      if (profileError) {
        console.error("❌ Profile approval error:", profileError);
        throw profileError;
      }
      
      console.log("✅ Staff approved successfully");
      setStatus({ type: 'success', msg: "Staff account activated successfully." });
      
      fetchData();
    } catch (error) {
      console.error("💥 Approval failed:", error);
      setStatus({ type: 'error', msg: "Approval failed. Please try again." });
    }
    setLoading(null);
  };

  // Reject staff
  const handleRejectStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to reject this staff member? This will delete their registration.")) return;
    
    setLoading(`reject-${staffId}`);
    try {
      const { error } = await supabase
        .from('staff_profiles')
        .delete()
        .eq('id', staffId);
      
      if (error) throw error;
      
      setStatus({ type: 'success', msg: "Staff request rejected and removed." });
      fetchData();
    } catch (error) {
      setStatus({ type: 'error', msg: "Rejection failed. Please try again." });
    }
    setLoading(null);
  };

  // Export functions
  const handleExportStudents = () => {
    const headers = ['ID', 'Name', 'Class', 'Candidate Number', 'Payment Type', 'Amount Owing', 'Term 1 2026', 'Total Fees', 'Total Paid', 'Total Balance', 'Parent Contact', 'Email', 'Status'];
    const csvData = students.map(s => {
      const paymentType = determinePaymentType(s);
      const studentStatus = determineStudentStatus(s);
      const fees = calculateStudentFees(s);
      
      return [
        s.id,
        s.name,
        s.student_class,
        s.candidate_number || 'N/A',
        paymentType.charAt(0).toUpperCase() + paymentType.slice(1),
        s.amount_owing,
        fees.term1_2026,
        fees.totalFees,
        fees.totalPaid,
        fees.totalBalance,
        s.parent_contact || 'N/A',
        s.email || 'N/A',
        studentStatus.charAt(0).toUpperCase() + studentStatus.slice(1)
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setStatus({ type: 'success', msg: "Student ledger exported successfully" });
  };

  const handleExportStaff = () => {
    const headers = ['EC Number', 'Full Name', 'Gender', 'Designation', 'Department', 'Subject Taught', 'Contact Number', 'Email Address', 'Date of Appointment', 'Status'];
    
    const csvData = allStaff.map(staff => [
      staff.ec_number,
      staff.full_name,
      staff.gender,
      staff.designation,
      staff.department,
      staff.subject_taught || 'N/A',
      staff.contact_number || 'N/A',
      staff.email_address || 'N/A',
      staff.date_of_appointment || 'N/A',
      staff.is_active ? 'Active' : 'Inactive'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-master-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    setStatus({ type: 'success', msg: "Staff master list exported successfully" });
  };

  // Logout
  const handleLogout = () => {
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/portal');
    }
  };

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'finance', label: 'Financial Control', icon: CreditCard },
    { id: 'students', label: 'Student Registry', icon: GraduationCap },
    { id: 'staff', label: 'Staff Management', icon: Users, count: pendingStaff.length },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart4 },
  ];

  // Check auth and fetch data
  useEffect(() => {
    if (hasCheckedAuth.current || hasRedirected.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      try {
        const adminAuth = localStorage.getItem('admin_authenticated');
        
        if (adminAuth !== 'true') {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            setStatus({ type: 'error', msg: "Unauthorized access. Redirecting..." });
            setTimeout(() => {
              router.replace('/portal');
            }, 500);
          }
          return;
        }

        console.log("🚀 Authenticated, fetching data...");
        await fetchData();
        
        // Real-time subscriptions
        console.log("📡 Setting up real-time subscription...");
        const channel = supabase
          .channel('realtime-admin')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'student_ledger'
            },
            () => {
              console.log("🔔 Student ledger change detected");
              fetchData();
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'staff_master_list'
            },
            () => {
              console.log("🔔 Staff change detected");
              fetchData();
            }
          )
          .subscribe((status) => {
            console.log("📡 Realtime subscription status:", status);
          });

        return () => {
          console.log("🧹 Cleaning up real-time subscription");
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Auth check failed:', error);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace('/portal');
        }
      }
    };

    checkAuth();
  }, [router, fetchData]);

  if (!hasCheckedAuth.current || hasRedirected.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex font-sans text-slate-900">
      {/* SIDE NAVIGATION */}
      <aside className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col sticky top-0 h-screen shadow-2xl border-r border-slate-700">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-xl shadow-lg shadow-blue-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter italic">MASTER<span className="text-cyan-400">OPS</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Detema Systems v3.1</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-300">Logged in as: <span className="font-bold text-cyan-400">MASTER_ADMIN</span></p>
            <p className="text-xs text-slate-400 mt-1">Pending Staff: <span className="font-bold text-red-400">{pendingStaff.length}</span></p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all font-semibold text-sm ${view === item.id 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-600/20' 
                : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                {item.label}
              </div>
              {item.count ? (
                <span className="bg-red-500 text-xs px-2 py-1 rounded-full animate-pulse">{item.count}</span>
              ) : (
                <ChevronRight size={14} className="opacity-40" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Students</span>
              <span className="font-bold text-cyan-400">{analytics.activeStudents}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-slate-400">Completed Students</span>
              <span className="font-bold text-purple-400">{analytics.completedStudents}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-slate-400">Total Arrears</span>
              <span className="font-bold text-red-400">${analytics.totalArrears.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-slate-400">Collection Rate</span>
              <span className="font-bold text-green-400">{analytics.collectionRate}%</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold text-sm border border-red-500/20"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight">
              {view === 'student_details' && selectedStudent 
                ? `Student Profile: ${selectedStudent.name}` 
                : view.replace('_', ' ')} Control Panel
            </h2>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Active Students: <span className="font-bold">{analytics.activeStudents}</span>
              <span className="mx-3">|</span>
              Completed: <span className="font-bold text-purple-500">{analytics.completedStudents}</span>
              <span className="mx-3">|</span>
              Arrears: <span className="font-bold text-red-500">${analytics.totalArrears.toLocaleString()}</span>
              <span className="mx-3">|</span>
              Collection: <span className="font-bold text-emerald-500">{analytics.collectionRate}%</span>
              <span className="mx-3">|</span>
              Pending Staff: <span className="font-bold text-red-500">{pendingStaff.length}</span>
            </p>
          </div>
          <div className="flex gap-3">
            {view === 'student_details' && (
              <button 
                onClick={() => setView('finance')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
              >
                <ChevronLeft size={18} />
                Back to Finance
              </button>
            )}
            <button 
              onClick={fetchData}
              disabled={loading === 'fetching'}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 shadow-sm disabled:opacity-50"
            >
              <RefreshCcw size={18} className={loading === 'fetching' ? 'animate-spin' : ''} />
            </button>
            <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-3 rounded-xl shadow-lg text-white">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest">LIVE</span>
            </div>
          </div>
        </header>

        {status && (
          <div className={`mb-6 p-4 rounded-xl flex justify-between items-center text-sm font-medium animate-in slide-in-from-top-4 ${status.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : status.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            <div className="flex items-center gap-3">
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              {status.msg}
            </div>
            <button onClick={() => setStatus(null)} className="hover:scale-110 transition-transform">
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* --- VIEW: OVERVIEW --- */}
        {view === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <UsersIcon size={32} />
                  <TrendingUpIcon size={24} className="opacity-60" />
                </div>
                <h3 className="text-3xl font-black mb-1">{analytics.totalStudents}</h3>
                <p className="text-blue-100 text-sm font-medium">Total Students</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <DollarSignIcon size={32} />
                  <TargetIcon size={24} className="opacity-60" />
                </div>
                <h3 className="text-3xl font-black mb-1">{analytics.activeStudents}</h3>
                <p className="text-emerald-100 text-sm font-medium">Active Students</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle size={32} />
                  <TrendingDownIcon size={24} className="opacity-60" />
                </div>
                <h3 className="text-3xl font-black mb-1">${analytics.totalArrears.toLocaleString()}</h3>
                <p className="text-amber-100 text-sm font-medium">Total Arrears</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Activity size={32} />
                  <PieChart size={24} className="opacity-60" />
                </div>
                <h3 className="text-3xl font-black mb-1">{analytics.collectionRate}%</h3>
                <p className="text-purple-100 text-sm font-medium">Collection Rate</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard size={20} />
                  Financial Summary by Type
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-slate-600">BEAM Students</span>
                    <span className="font-bold text-slate-900">{analytics.beamStudents}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-slate-600">SOLON Students</span>
                    <span className="font-bold text-slate-900">{analytics.solonStudents}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm text-slate-600">Direct Pay Students</span>
                    <span className="font-bold text-slate-900">{analytics.directPayStudents}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Other Students</span>
                    <span className="font-bold text-slate-900">{analytics.otherStudents}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <UserPlus size={20} />
                  Staff Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Master List</span>
                    <span className="font-bold text-slate-900">{allStaff.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm text-slate-600">Approved Staff</span>
                    <span className="font-bold text-emerald-600">{approvedStaff.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-slate-600">Pending Approval</span>
                    <span className="font-bold text-red-600">{pendingStaff.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldAlert size={20} />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={handleBulkBillStudents}
                    className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign size={20} className="text-blue-600" />
                        <span className="font-semibold text-slate-900">Bill All Active Students ($70)</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  <button 
                    onClick={() => setView('staff')}
                    className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserPlus size={20} className="text-purple-600" />
                        <span className="font-semibold text-slate-900">Staff Management</span>
                      </div>
                      {pendingStaff.length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {pendingStaff.length}
                        </span>
                      )}
                    </div>
                  </button>

                  <button 
                    onClick={handleExportStudents}
                    className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Download size={20} className="text-emerald-600" />
                        <span className="font-semibold text-slate-900">Export Data</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  <button 
                    onClick={() => setView('reports')}
                    className="w-full p-4 bg-amber-50 hover:bg-amber-100 rounded-xl text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart4 size={20} className="text-amber-600" />
                        <span className="font-semibold text-slate-900">Analytics & Reports</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Breakdown by Payment Type */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calculator size={20} />
                Financial Breakdown by Payment Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-blue-800 mb-2">BEAM Students</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-bold">${financialSummary.beamTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Paid:</span>
                      <span className="font-bold text-emerald-600">${financialSummary.beamPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Balance:</span>
                      <span className="font-bold text-red-600">${financialSummary.beamBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-purple-800 mb-2">SOLON Students</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-bold">${financialSummary.solonTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Paid:</span>
                      <span className="font-bold text-emerald-600">${financialSummary.solonPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Balance:</span>
                      <span className="font-bold text-red-600">${financialSummary.solonBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-emerald-800 mb-2">Direct Pay</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-bold">${financialSummary.directPayTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Paid:</span>
                      <span className="font-bold text-emerald-600">${financialSummary.directPayPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Balance:</span>
                      <span className="font-bold text-red-600">${financialSummary.directPayBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Other Students</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-bold">${financialSummary.otherTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Paid:</span>
                      <span className="font-bold text-emerald-600">${financialSummary.otherPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Balance:</span>
                      <span className="font-bold text-red-600">${financialSummary.otherBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: FINANCE --- */}
        {view === 'finance' && (
          <div className="space-y-6">
            {/* Selection Controls */}
            {selectedStudents.size > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 animate-in slide-in-from-top-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckSquare className="text-blue-600" size={20} />
                    <span className="font-semibold text-blue-700">
                      {selectedStudents.size} student(s) selected
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBulkActionModal(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Bulk Actions
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2 border border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button 
                  onClick={() => setAddStudentModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  Add New Student
                </button>
                <button 
                  onClick={handleBulkBillStudents}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <DollarSign size={18} />
                  Bill All Students ($70)
                </button>
                <button 
                  onClick={handleExportStudents}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Search Students
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, email, phone, candidate number..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Filter by Class
                </label>
                <div className="relative">
                  <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors appearance-none"
                  >
                    <option value="All">All Classes</option>
                    <option value="Form 1 East">Form 1 East</option>
                    <option value="Form 1 West">Form 1 West</option>
                    <option value="Form 2 East">Form 2 East</option>
                    <option value="Form 2 West">Form 2 West</option>
                    <option value="Form 3 North">Form 3 North</option>
                    <option value="Form 3 South">Form 3 South</option>
                    <option value="Form 4 North">Form 4 North</option>
                    <option value="Form 4 South">Form 4 South</option>
                    <option value="Form 5">Form 5</option>
                    <option value="Form 6">Form 6</option>
                  </select>
                </div>
              </div>

              <div className="w-full md:w-48">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Payment Type
                </label>
                <select 
                  value={filterPaymentType}
                  onChange={(e) => setFilterPaymentType(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="beam">BEAM</option>
                  <option value="solon">SOLON</option>
                  <option value="direct">Direct Pay</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={selectAllFiltered}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
                >
                  Select All
                </button>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setActiveTab('all');
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'all' && filterStatus === 'all'
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
              >
                All ({students.filter(s => determineStudentStatus(s) === 'active').length})
              </button>
              <button
                onClick={() => {
                  setFilterStatus("active");
                  setActiveTab('arrears');
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'arrears' && filterStatus === 'active'
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
              >
                With Arrears ({students.filter(s => {
                  const fees = calculateStudentFees(s);
                  return determineStudentStatus(s) === 'active' && fees.totalBalance > 0;
                }).length})
              </button>
              <button
                onClick={() => {
                  setFilterStatus("active");
                  setActiveTab('paid');
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'paid' && filterStatus === 'active'
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
              >
                Paid ({students.filter(s => {
                  const fees = calculateStudentFees(s);
                  return determineStudentStatus(s) === 'active' && fees.totalBalance <= 0;
                }).length})
              </button>
              <button
                onClick={() => {
                  setFilterStatus("completed");
                  setActiveTab('all');
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${filterStatus === 'completed'
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
              >
                Completed ({analytics.completedStudents})
              </button>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-12">
                        <input 
                          type="checkbox"
                          checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                          onChange={selectAllFiltered}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Payment Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Candidate No.</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Term 1 2026</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total Paid</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total Balance</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map(s => {
                      const fees = calculateStudentFees(s);
                      const paymentType = determinePaymentType(s);
                      const studentStatus = determineStudentStatus(s);
                      const isSelected = selectedStudents.has(s.id);
                      return (
                        <tr key={s.id} className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-4">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudentSelection(s.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                                studentStatus === 'completed' ? 'bg-purple-500' :
                                paymentType === 'beam' ? 'bg-blue-500' :
                                paymentType === 'solon' ? 'bg-purple-500' :
                                paymentType === 'direct' ? 'bg-emerald-500' : 'bg-slate-500'
                              }`}>
                                {s.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{s.name}</p>
                                <p className="text-xs text-slate-500">{s.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {s.student_class}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              paymentType === 'beam' ? 'bg-blue-100 text-blue-700' :
                              paymentType === 'solon' ? 'bg-purple-100 text-purple-700' :
                              paymentType === 'direct' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {paymentType.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm">
                            {s.candidate_number || 'N/A'}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm">
                            ${fees.term1_2026}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-emerald-600">
                            ${fees.totalPaid}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${
                              studentStatus === 'completed' ? 'text-purple-600' :
                              fees.totalBalance <= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              ${fees.totalBalance}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{s.parent_contact || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              studentStatus === 'completed' ? 'bg-purple-100 text-purple-700' :
                              studentStatus === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {studentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedStudent(s);
                                  setPaymentModal(true);
                                }}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Record Payment"
                              >
                                <DollarSign size={16} />
                              </button>
                              <button 
                                onClick={() => handleEditStudent(s)}
                                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: STAFF MANAGEMENT --- */}
        {view === 'staff' && (
          <div className="space-y-6">
            {/* Staff Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Show all staff
                  setView('staff');
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${'bg-blue-500 text-white'}`}
              >
                Master List ({allStaff.length})
              </button>
              <button
                onClick={() => {
                  // Show pending staff
                  setView('staff');
                }}
                className="px-6 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Pending Approval ({pendingStaff.length})
              </button>
              <button
                onClick={() => {
                  // Show approved staff
                  setView('staff');
                }}
                className="px-6 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Approved Staff ({approvedStaff.length})
              </button>
            </div>

            {/* Staff Master List */}
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">Staff Master List</h3>
                    <p className="text-blue-700 text-sm">
                      {allStaff.length} staff members in the system
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={fetchData}
                      disabled={loading === 'fetching'}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      {loading === 'fetching' ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <RefreshCcw size={16} />
                      )}
                      Refresh
                    </button>
                    <button 
                      onClick={handleExportStaff}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Download size={16} />
                      Export List
                    </button>
                  </div>
                </div>
              </div>

              {/* Staff Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">EC Number</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Designation</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allStaff.map((staff) => (
                        <tr key={staff.ec_number} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm">
                            {staff.ec_number}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {staff.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{staff.full_name}</p>
                                <p className="text-xs text-slate-500">{staff.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {staff.designation}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                              {staff.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{staff.contact_number || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{staff.email_address || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              staff.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {staff.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pending Staff Approvals */}
            {pendingStaff.length > 0 && (
              <div className="space-y-6 mt-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-red-900">Pending Staff Approvals</h3>
                      <p className="text-red-700 text-sm">
                        {pendingStaff.length} request{pendingStaff.length !== 1 ? 's' : ''} awaiting review
                      </p>
                    </div>
                    {pendingStaff.length > 0 && (
                      <button 
                        onClick={() => {
                          if (confirm(`Approve all ${pendingStaff.length} pending staff?`)) {
                            pendingStaff.forEach(staff => handleApproveStaff(staff.id));
                          }
                        }}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        Approve All
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {pendingStaff.map((staff) => (
                    <div key={staff.id} className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                            {staff.full_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold text-slate-900">{staff.full_name}</h4>
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                PENDING
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-1 mb-3">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                {staff.designation}
                              </span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                {staff.department}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <IdCard size={14} className="text-slate-400" />
                                <span className="font-mono text-slate-600">{staff.ec_number}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail size={14} className="text-slate-400" />
                                <span className="text-slate-600">{staff.email_address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-slate-400" />
                                <span className="text-slate-600">{staff.contact_number}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <BookOpen size={14} className="text-slate-400" />
                                <span className="text-slate-600">{staff.subject_taught || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 text-xs text-slate-500">
                              Registered: {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 ml-4">
                          <button 
                            onClick={() => handleApproveStaff(staff.id)}
                            disabled={loading === `approve-${staff.id}`}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {loading === `approve-${staff.id}` ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <CheckCircle2 size={18} />
                            )}
                            Approve
                          </button>
                          
                          <button 
                            onClick={() => handleRejectStaff(staff.id)}
                            disabled={loading === `reject-${staff.id}`}
                            className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {loading === `reject-${staff.id}` ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <XCircle size={18} />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: REPORTS --- */}
        {view === 'reports' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <UsersIcon size={32} />
                  <TrendingUpIcon size={24} className="opacity-60" />
                </div>
                <h3 className="text-3xl font-black mb-1">{analytics.totalStudents}</h3>
                <p className="text-blue-100 text-sm font-medium">Total Students</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <DollarSignIcon size={32} />
                  <TargetIcon size={24} className="opacity-60" />
                </div>
                <h3 className="text-3xl font-black mb-1">{analytics.activeStudents}</h3>
                <p className="text-emerald-100 text-sm font-medium">Active Students</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle size={32} />
                  <TrendingDownIcon size={24} className="opacity-60" />
                </div>
                <h3 className="text-3xl font-black mb-1">${analytics.totalArrears.toLocaleString()}</h3>
                <p className="text-amber-100 text-sm font-medium">Total Arrears</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <Activity size={32} />
                  <PieChart size={24} className="opacity-60" />
                </div>
                <h3 className="text-3xl font-black mb-1">{analytics.collectionRate}%</h3>
                <p className="text-purple-100 text-sm font-medium">Collection Rate</p>
              </div>
            </div>

            {/* Payment Type Analysis */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Payment Type Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-blue-800 mb-4">BEAM Students</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Students</span>
                      <span className="font-bold">{analytics.beamStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Arrears</span>
                      <span className="font-bold text-red-600">${analytics.beamArrears.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">% of Total</span>
                      <span className="font-bold">
                        {analytics.activeStudents > 0 ? ((analytics.beamStudents / analytics.activeStudents) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-purple-800 mb-4">SOLON Students</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Students</span>
                      <span className="font-bold">{analytics.solonStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Arrears</span>
                      <span className="font-bold text-red-600">${analytics.solonArrears.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">% of Total</span>
                      <span className="font-bold">
                        {analytics.activeStudents > 0 ? ((analytics.solonStudents / analytics.activeStudents) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-emerald-800 mb-4">Direct Pay Students</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Students</span>
                      <span className="font-bold">{analytics.directPayStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Arrears</span>
                      <span className="font-bold text-red-600">${analytics.directPayArrears.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">% of Total</span>
                      <span className="font-bold">
                        {analytics.activeStudents > 0 ? ((analytics.directPayStudents / analytics.activeStudents) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl">
                  <h4 className="font-bold text-slate-800 mb-4">Other Students</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Students</span>
                      <span className="font-bold">{analytics.otherStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Arrears</span>
                      <span className="font-bold text-red-600">${analytics.otherArrears.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">% of Total</span>
                      <span className="font-bold">
                        {analytics.activeStudents > 0 ? ((analytics.otherStudents / analytics.activeStudents) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Financial Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Total Fees Expected</span>
                    <span className="text-sm font-bold text-blue-600">${analytics.totalFees.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Total Collected</span>
                    <span className="text-sm font-bold text-emerald-600">${analytics.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                      style={{ width: `${analytics.totalFees > 0 ? (analytics.totalPaid / analytics.totalFees) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Total Outstanding</span>
                    <span className="text-sm font-bold text-red-600">${analytics.totalArrears.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                      style={{ width: `${analytics.totalFees > 0 ? (analytics.totalArrears / analytics.totalFees) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Class-wise Analysis */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Class-wise Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total Students</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Active Students</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Completed</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total Fees</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total Paid</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total Balance</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Collection Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {['Form 1 East', 'Form 1 West', 'Form 2 East', 'Form 2 West', 'Form 3 North', 'Form 3 South', 'Form 4 North', 'Form 4 South', 'Form 5', 'Form 6'].map((className) => {
                      const classStudents = students.filter(s => s.student_class === className);
                      const activeStudents = classStudents.filter(s => determineStudentStatus(s) === 'active');
                      const completedStudents = classStudents.filter(s => determineStudentStatus(s) === 'completed');
                      
                      let totalFees = 0;
                      let totalPaid = 0;
                      let totalBalance = 0;
                      
                      activeStudents.forEach(s => {
                        const fees = calculateStudentFees(s);
                        totalFees += fees.totalFees;
                        totalPaid += fees.totalPaid;
                        totalBalance += fees.totalBalance;
                      });
                      
                      const collectionRate = totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(1) : '0';
                      
                      return (
                        <tr key={className} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {className}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold">{classStudents.length}</td>
                          <td className="px-6 py-4 text-emerald-600 font-semibold">{activeStudents.length}</td>
                          <td className="px-6 py-4 text-purple-600 font-semibold">{completedStudents.length}</td>
                          <td className="px-6 py-4 font-mono">${totalFees.toLocaleString()}</td>
                          <td className="px-6 py-4 font-mono text-emerald-600">${totalPaid.toLocaleString()}</td>
                          <td className="px-6 py-4 font-mono text-red-600">${totalBalance.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${parseFloat(collectionRate) >= 80 ? 'text-emerald-600' : parseFloat(collectionRate) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                              {collectionRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PAYMENT MODAL --- */}
        {paymentModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Record Payment</h3>
                <button 
                  onClick={() => setPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Amount ($)</label>
                  <input 
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                  <select 
                    value={newPayment.payment_method}
                    onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
                  <textarea 
                    value={newPayment.description}
                    onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    rows={3}
                    placeholder="Payment details..."
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between mb-4">
                    <span className="text-slate-600">Student</span>
                    <span className="font-semibold">{selectedStudent.name}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-slate-600">Current Balance</span>
                    <span className="font-bold text-red-600">
                      ${calculateStudentFees(selectedStudent).totalBalance.toLocaleString()}
                    </span>
                  </div>
                  {newPayment.amount && (
                    <div className="flex justify-between mb-6">
                      <span className="text-slate-600">New Balance</span>
                      <span className="font-bold text-emerald-600">
                        ${(calculateStudentFees(selectedStudent).totalBalance - parseFloat(newPayment.amount || '0')).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setPaymentModal(false)}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddPayment}
                    disabled={!newPayment.amount || loading === 'adding-payment'}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading === 'adding-payment' ? (
                      <Loader2 className="animate-spin inline mr-2" size={18} />
                    ) : (
                      <CheckCircle2 className="inline mr-2" size={18} />
                    )}
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- BULK ACTION MODAL --- */}
        {bulkActionModal && selectedStudents.size > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Bulk Actions</h3>
                <button 
                  onClick={() => setBulkActionModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="text-blue-600" size={20} />
                    <span className="font-semibold text-blue-700">
                      {selectedStudents.size} student(s) selected
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleBulkSendReminders}
                    disabled={loading === 'bulk-reminders'}
                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-3"
                  >
                    <Mail size={18} />
                    Send Payment Reminders
                    {loading === 'bulk-reminders' && (
                      <Loader2 className="animate-spin ml-auto" size={18} />
                    )}
                  </button>
                </div>
                
                <div className="pt-6 border-t border-slate-200">
                  <button 
                    onClick={() => setBulkActionModal(false)}
                    className="w-full px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ADD STUDENT MODAL --- */}
        {addStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Add New Student</h3>
                <button 
                  onClick={() => setAddStudentModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                    <input 
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Class *</label>
                    <select 
                      value={newStudent.student_class}
                      onChange={(e) => setNewStudent({...newStudent, student_class: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    >
                      <option value="">Select Class</option>
                      <option value="Form 1 East">Form 1 East</option>
                      <option value="Form 1 West">Form 1 West</option>
                      <option value="Form 2 East">Form 2 East</option>
                      <option value="Form 2 West">Form 2 West</option>
                      <option value="Form 3 North">Form 3 North</option>
                      <option value="Form 3 South">Form 3 South</option>
                      <option value="Form 4 North">Form 4 North</option>
                      <option value="Form 4 South">Form 4 South</option>
                      <option value="Form 5">Form 5</option>
                      <option value="Form 6">Form 6</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Candidate Number</label>
                    <input 
                      type="text"
                      value={newStudent.candidate_number}
                      onChange={(e) => setNewStudent({...newStudent, candidate_number: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                      placeholder="e.g., 2023-001"
                    />
                    <p className="text-xs text-slate-500 mt-1">Students with 2022 are marked as completed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Type</label>
                    <select 
                      value={newStudent.payment_type}
                      onChange={(e) => setNewStudent({...newStudent, payment_type: e.target.value as any})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    >
                      <option value="direct">Direct Pay ($70)</option>
                      <option value="beam">BEAM</option>
                      <option value="solon">SOLON</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {newStudent.payment_type !== 'direct' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Owing Notes</label>
                      <input 
                        type="text"
                        value={newStudent.amount_owing}
                        onChange={(e) => setNewStudent({...newStudent, amount_owing: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                        placeholder="e.g., BEAM Pending, SOLON Approved, etc."
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Parent Contact</label>
                    <input 
                      type="text"
                      value={newStudent.parent_contact}
                      onChange={(e) => setNewStudent({...newStudent, parent_contact: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input 
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                      placeholder="parent@example.com"
                    />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex justify-between mb-4">
                    <span className="text-slate-600">Term 1 2026 Fees:</span>
                    <span className="font-bold">
                      ${newStudent.candidate_number?.includes('2022') ? '0' : '70'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-slate-600">Status:</span>
                    <span className="font-bold">
                      {newStudent.candidate_number?.includes('2022') ? 'Completed' : 'Active'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setAddStudentModal(false)}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddStudent}
                    disabled={!newStudent.name || !newStudent.student_class || loading === 'adding-student'}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading === 'adding-student' ? (
                      <Loader2 className="animate-spin inline mr-2" size={18} />
                    ) : (
                      <UserPlus className="inline mr-2" size={18} />
                    )}
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- EDIT STUDENT MODAL --- */}
        {editStudentModal && studentToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Edit Student: {studentToEdit.name}</h3>
                <button 
                  onClick={() => setEditStudentModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                    <input 
                      type="text"
                      value={editStudentData.name || ''}
                      onChange={(e) => setEditStudentData({...editStudentData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
                    <select 
                      value={editStudentData.student_class || ''}
                      onChange={(e) => setEditStudentData({...editStudentData, student_class: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    >
                      <option value="Form 1 East">Form 1 East</option>
                      <option value="Form 1 West">Form 1 West</option>
                      <option value="Form 2 East">Form 2 East</option>
                      <option value="Form 2 West">Form 2 West</option>
                      <option value="Form 3 North">Form 3 North</option>
                      <option value="Form 3 South">Form 3 South</option>
                      <option value="Form 4 North">Form 4 North</option>
                      <option value="Form 4 South">Form 4 South</option>
                      <option value="Form 5">Form 5</option>
                      <option value="Form 6">Form 6</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Candidate Number</label>
                    <input 
                      type="text"
                      value={editStudentData.candidate_number || ''}
                      onChange={(e) => setEditStudentData({...editStudentData, candidate_number: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Owing</label>
                    <input 
                      type="text"
                      value={editStudentData.amount_owing || ''}
                      onChange={(e) => setEditStudentData({...editStudentData, amount_owing: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Parent Contact</label>
                    <input 
                      type="text"
                      value={editStudentData.parent_contact || ''}
                      onChange={(e) => setEditStudentData({...editStudentData, parent_contact: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input 
                      type="email"
                      value={editStudentData.email || ''}
                      onChange={(e) => setEditStudentData({...editStudentData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <select 
                      value={editStudentData.status || 'active'}
                      onChange={(e) => setEditStudentData({...editStudentData, status: e.target.value as any})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Term 1 2026 Fees:</span>
                    <span className="font-bold">
                      ${editStudentData.status === 'completed' ? '0' : '70'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-slate-600">Payment Type:</span>
                    <span className="font-bold">
                      {determinePaymentType(editStudentData as Student).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setEditStudentModal(false)}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEditStudent}
                    disabled={!editStudentData.name || loading === 'saving-student'}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading === 'saving-student' ? (
                      <Loader2 className="animate-spin inline mr-2" size={18} />
                    ) : (
                      <CheckCircle2 className="inline mr-2" size={18} />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}