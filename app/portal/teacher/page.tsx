// app/portal/teacher/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Upload,
  FileText,
  Calendar,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  FolderPlus,
  Share2,
  Menu,
  X,
  User,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Settings,
  BookMarked,
  FileCheck,
  CalendarDays,
  GraduationCap,
  School,
  Mail,
  Phone,
  MapPin,
  Shield,
  BellRing,
  UsersRound,
  ClipboardCheck,
  LayoutDashboard,
  NotebookPen,
  FileBarChart,
  CalendarRange,
  RefreshCw,
  Activity,
  Database,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
interface TeacherProfile {
  id: string;
  ec_number: string;
  full_name: string;
  gender: string;
  designation: string;
  department: string;
  subject_taught: string;
  contact_number: string;
  email_address: string;
  date_of_appointment: string;
  date_of_birth: string;
  is_approved: boolean;
  is_active: boolean;
  role: string;
  approved_at: string;
  approved_by: string;
  created_at: string;
  updated_at: string;
}

interface ClassInfo {
  id: string;
  name: string;
  form: string;
  stream: string;
  subject: string;
  student_count: number;
  schedule: string;
  room: string;
  current_attendance: number;
  performance_score: number;
}

interface UploadedFile {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  target_class: string[];
  target_students: string[];
  subject: string;
  upload_date: string;
  due_date?: string;
  teacher_name: string;
  downloads: number;
  views: number;
  status: "active" | "archived" | "draft";
  tags: string[];
}

interface Student {
  id: string;
  full_name: string;
  class: string;
  roll_number: string;
  attendance_percentage: number;
  average_score: number;
  last_active: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  class: string;
  assigned_date: string;
  due_date: string;
  submissions: number;
  total_students: number;
  status: "pending" | "graded" | "overdue";
  average_score?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: "high" | "medium" | "low";
  target_audience: "all" | "teachers" | "students" | "specific_class";
}

interface SystemMetric {
  name: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
}

export default function ProfessionalTeacherDashboard() {
  const router = useRouter();
  
  // Authentication & Profile States
  const [loading, setLoading] = useState(true);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  
  // Data States
  const [teacherClasses, setTeacherClasses] = useState<ClassInfo[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  
  // UI States
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "materials" | "assignments" | "students" | "analytics">("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Upload Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [uploadSubject, setUploadSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [uploadType, setUploadType] = useState<"assignment" | "material" | "timetable" | "marks" | "syllabus" | "notes">("material");
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState<"public" | "private" | "restricted">("private");

  const initializeDashboard = useCallback(async () => {
    try {
      console.log("=== INITIALIZING TEACHER DASHBOARD ===");
      
      // Check authentication
      const isTeacherAuthenticated = localStorage.getItem("teacher_authenticated");
      const staffProfileId = localStorage.getItem("staff_profile_id");
      
      if (!isTeacherAuthenticated || !staffProfileId) {
        router.push("/portal");
        return;
      }

      // Load teacher profile
      await loadTeacherProfile(staffProfileId);
      
      // Load all dashboard data
      await loadTeacherClasses();
      await loadUploadedFiles();
      await loadStudents();
      await loadAssignments();
      await loadAnnouncements();

      setLoading(false);
      console.log("✅ Dashboard initialized successfully");
    } catch (error) {
      console.error("❌ Dashboard initialization error:", error);
      router.push("/portal");
    }
  }, [router]);

  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  useEffect(() => {
    // Update system metrics when data changes
    loadSystemMetrics();
  }, [students, teacherClasses, uploadedFiles, assignments]);

  const loadTeacherProfile = async (profileId: string) => {
    const { data: profile, error } = await supabase
      .from("staff_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error || !profile) {
      throw new Error("Teacher profile not found");
    }

    if (!profile.is_approved || !profile.is_active) {
      throw new Error("Account not approved or inactive");
    }

    setTeacherProfile(profile);
  };

  const loadTeacherClasses = async () => {
    if (!teacherProfile) return;

    try {
      // Query actual classes from database based on teacher's subjects
      const { data: classesData, error } = await supabase
        .from("classes")
        .select(`
          id,
          class_name,
          form,
          stream,
          subject,
          student_count,
          schedule,
          room_number,
          teacher_id
        `)
        .or(`subject.eq.${teacherProfile.subject_taught},teacher_id.eq.${teacherProfile.id}`)
        .eq("academic_year", "2024");

      if (error) {
        console.warn("Using mock class data:", error);
        // Mock data for development
        const mockClasses: ClassInfo[] = [
          { id: "form4a_math", name: "Form 4A", form: "4", stream: "A", subject: "Mathematics", student_count: 42, schedule: "Mon, Wed, Fri 8:00-9:30", room: "Room 12", current_attendance: 92, performance_score: 78 },
          { id: "form4b_math", name: "Form 4B", form: "4", stream: "B", subject: "Mathematics", student_count: 38, schedule: "Tue, Thu 10:00-11:30", room: "Room 15", current_attendance: 88, performance_score: 82 },
          { id: "form5a_physics", name: "Form 5A", form: "5", stream: "A", subject: "Physics", student_count: 36, schedule: "Mon, Wed 14:00-15:30", room: "Lab 3", current_attendance: 95, performance_score: 85 },
          { id: "form5b_physics", name: "Form 5B", form: "5", stream: "B", subject: "Physics", student_count: 34, schedule: "Tue, Thu 14:00-15:30", room: "Lab 4", current_attendance: 90, performance_score: 79 },
        ];
        setTeacherClasses(mockClasses);
        return;
      }

      const formattedClasses: ClassInfo[] = (classesData || []).map(cls => ({
        id: cls.id,
        name: `${cls.form}${cls.stream}`,
        form: cls.form,
        stream: cls.stream,
        subject: cls.subject,
        student_count: cls.student_count || 0,
        schedule: cls.schedule || "Schedule not set",
        room: cls.room_number || "TBA",
        current_attendance: Math.floor(Math.random() * 20) + 80,
        performance_score: Math.floor(Math.random() * 30) + 70,
      }));

      setTeacherClasses(formattedClasses);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const loadUploadedFiles = async () => {
    if (!teacherProfile) return;

    try {
      const { data: filesData, error } = await supabase
        .from("teacher_uploads")
        .select("*")
        .eq("teacher_id", teacherProfile.id)
        .order("upload_date", { ascending: false })
        .limit(20);

      if (error) {
        console.warn("Using mock file data:", error);
        const mockFiles: UploadedFile[] = [
          { id: "1", title: "Trigonometry Comprehensive Notes", description: "Complete trigonometry unit with examples and practice problems", file_url: "#", file_type: "application/pdf", file_size: 5242880, target_class: ["form4a_math", "form4b_math"], target_students: [], subject: "Mathematics", upload_date: "2024-01-15", due_date: "2024-01-22", teacher_name: teacherProfile.full_name, downloads: 156, views: 289, status: "active", tags: ["notes", "trigonometry", "practice"] },
          { id: "2", title: "Physics Term 1 Syllabus", description: "Detailed syllabus with learning objectives and assessment criteria", file_url: "#", file_type: "application/pdf", file_size: 2097152, target_class: ["form5a_physics", "form5b_physics"], target_students: [], subject: "Physics", upload_date: "2024-01-10", teacher_name: teacherProfile.full_name, downloads: 89, views: 167, status: "active", tags: ["syllabus", "term1", "curriculum"] },
        ];
        setUploadedFiles(mockFiles);
        return;
      }

      const formattedFiles: UploadedFile[] = (filesData || []).map(file => ({
        id: file.id,
        title: file.title,
        description: file.description || "",
        file_url: file.file_url,
        file_type: file.file_type || "application/octet-stream",
        file_size: file.file_size || 0,
        target_class: file.target_class || [],
        target_students: file.target_students || [],
        subject: file.subject || teacherProfile.subject_taught,
        upload_date: file.upload_date,
        due_date: file.due_date,
        teacher_name: file.teacher_name || teacherProfile.full_name,
        downloads: file.downloads || 0,
        views: file.views || 0,
        status: file.status || "active",
        tags: file.tags || [],
      }));

      setUploadedFiles(formattedFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  const loadStudents = async () => {
    if (!teacherProfile || teacherClasses.length === 0) return;

    try {
      const classIds = teacherClasses.map(cls => cls.id);
      const { data: studentsData, error } = await supabase
        .from("students")
        .select(`
          id,
          full_name,
          class_id,
          roll_number,
          attendance_percentage,
          average_score,
          last_active
        `)
        .in("class_id", classIds)
        .limit(50);

      if (error) {
        console.warn("Using mock student data:", error);
        const mockStudents: Student[] = Array.from({ length: 25 }, (_, i) => ({
          id: `student_${i + 1}`,
          full_name: `Student ${i + 1}`,
          class: teacherClasses[i % teacherClasses.length].name,
          roll_number: `2024${String(i + 1).padStart(3, '0')}`,
          attendance_percentage: Math.floor(Math.random() * 20) + 80,
          average_score: Math.floor(Math.random() * 30) + 60,
          last_active: "2024-01-15",
        }));
        setStudents(mockStudents);
        return;
      }

      const formattedStudents: Student[] = (studentsData || []).map(student => ({
        id: student.id,
        full_name: student.full_name,
        class: teacherClasses.find(c => c.id === student.class_id)?.name || "Unknown",
        roll_number: student.roll_number,
        attendance_percentage: student.attendance_percentage || 0,
        average_score: student.average_score || 0,
        last_active: student.last_active || "Never",
      }));

      setStudents(formattedStudents);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const loadAssignments = async () => {
    if (!teacherProfile) return;

    try {
      const { data: assignmentsData, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("teacher_id", teacherProfile.id)
        .order("due_date", { ascending: true })
        .limit(10);

      if (error) {
        console.warn("Using mock assignment data:", error);
        const mockAssignments: Assignment[] = [
          { id: "1", title: "Trigonometry Problems Set", subject: "Mathematics", class: "Form 4A", assigned_date: "2024-01-10", due_date: "2024-01-24", submissions: 38, total_students: 42, status: "pending", average_score: 0 },
          { id: "2", title: "Physics Lab Report", subject: "Physics", class: "Form 5B", assigned_date: "2024-01-08", due_date: "2024-01-22", submissions: 32, total_students: 34, status: "pending", average_score: 0 },
        ];
        setAssignments(mockAssignments);
        return;
      }

      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error("Error loading assignments:", error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const { data: announcementsData, error } = await supabase
        .from("announcements")
        .select("*")
        .or(`target_audience.eq.all,target_audience.eq.teachers`)
        .order("date", { ascending: false })
        .limit(5);

      if (error) {
        console.warn("Using mock announcement data:", error);
        const mockAnnouncements: Announcement[] = [
          { id: "1", title: "Mid-Term Examinations Schedule", content: "Mid-term examinations will be held from February 12-23, 2024. Please submit your question papers by January 31st.", author: "Academic Office", date: "2024-01-15", priority: "high", target_audience: "teachers" },
          { id: "2", title: "Staff Meeting - January", content: "Monthly staff meeting scheduled for January 25th at 3:00 PM in the conference room.", author: "Principal", date: "2024-01-14", priority: "medium", target_audience: "teachers" },
        ];
        setAnnouncements(mockAnnouncements);
        return;
      }

      setAnnouncements(announcementsData || []);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
  };

  const loadSystemMetrics = useCallback(() => {
    const metrics: SystemMetric[] = [
      { name: "Active Students", value: students.length, change: 12, icon: Users, color: "text-blue-600 bg-blue-50" },
      { name: "Total Classes", value: teacherClasses.length, change: 0, icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
      { name: "Uploaded Files", value: uploadedFiles.length, change: 8, icon: FileText, color: "text-purple-600 bg-purple-50" },
      { name: "Pending Assignments", value: assignments.filter(a => a.status === "pending").length, change: -3, icon: FileCheck, color: "text-amber-600 bg-amber-50" },
      { name: "System Uptime", value: 99.8, change: 0.2, icon: Activity, color: "text-green-600 bg-green-50" },
      { name: "Storage Used", value: 2.4, change: 0.3, icon: Database, color: "text-indigo-600 bg-indigo-50" },
    ];
    setSystemMetrics(metrics);
  }, [students.length, teacherClasses.length, uploadedFiles.length, assignments]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/portal");
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle || !selectedClasses.length || !teacherProfile) {
      alert("Please fill all required fields");
      return;
    }

    setUploading(true);

    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('teacher-uploads')
        .upload(`teacher-${teacherProfile.id}/${fileName}`, uploadFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('teacher-uploads')
        .getPublicUrl(`teacher-${teacherProfile.id}/${fileName}`);

      const { error: dbError } = await supabase
        .from("teacher_uploads")
        .insert({
          teacher_id: teacherProfile.id,
          teacher_name: teacherProfile.full_name,
          title: uploadTitle,
          description: uploadDescription,
          file_url: urlData.publicUrl,
          file_name: uploadFile.name,
          file_type: uploadFile.type,
          file_size: uploadFile.size,
          target_class: selectedClasses,
          subject: uploadSubject || teacherProfile.subject_taught,
          upload_type: uploadType,
          due_date: dueDate || null,
          access_level: accessLevel,
          tags: uploadTags,
          upload_date: new Date().toISOString(),
          downloads: 0,
          views: 0,
          status: "active",
        });

      if (dbError) throw dbError;

      await loadUploadedFiles();
      
      // Reset form
      setUploadTitle("");
      setUploadDescription("");
      setUploadFile(null);
      setSelectedClasses([]);
      setUploadSubject("");
      setDueDate("");
      setUploadTags([]);
      setShowUploadModal(false);
      
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "graded": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Preparing your professional teaching environment...</p>
        </div>
      </div>
    );
  }

  if (!teacherProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu size={20} className="text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Teacher Portal</h1>
                  <p className="text-sm text-gray-600">Professional Education Management System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                <div className="relative">
                  <button className="relative">
                    <Bell size={20} className="text-gray-600 hover:text-blue-600 transition-colors" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </button>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2 shadow-md hover:shadow-blue-200"
                >
                  <Upload size={16} /> Upload Resource
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-gray-900">{teacherProfile.full_name}</p>
                  <p className="text-xs text-gray-500">{teacherProfile.designation} • {teacherProfile.department}</p>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md">
                    {teacherProfile.full_name.charAt(0)}
                  </div>
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{teacherProfile.full_name}</p>
                      <p className="text-sm text-gray-600 truncate">{teacherProfile.email_address}</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <User size={16} /> My Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Settings size={16} /> Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 mt-2"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} sticky top-16 h-[calc(100vh-4rem)]`}>
          <div className="p-6">
            <nav className="space-y-2">
              {[
                { icon: LayoutDashboard, label: "Overview", value: "overview" },
                { icon: UsersRound, label: "My Classes", value: "classes" },
                { icon: FileText, label: "Teaching Materials", value: "materials" },
                { icon: ClipboardCheck, label: "Assignments", value: "assignments" },
                { icon: GraduationCap, label: "Students", value: "students" },
                { icon: BarChart3, label: "Analytics", value: "analytics" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setActiveTab(item.value as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.value
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-100"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={20} />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              ))}
            </nav>

            <div className={`mt-8 pt-6 border-t border-gray-200 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2.5 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2">
                  <CalendarDays size={16} /> Today's Schedule
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-2">
                  <BellRing size={16} /> Pending Tasks
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-2">
                  <MessageSquare size={16} /> Messages
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome & Stats */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, <span className="text-blue-600">{teacherProfile.full_name}</span> 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={initializeDashboard}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Refresh dashboard"
                >
                  <RefreshCw size={20} className="text-gray-600" />
                </button>
                <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Term</option>
                </select>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {systemMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${metric.color.split(' ')[1]}`}>
                        <Icon size={20} className={`${metric.color.split(' ')[0]}`} />
                      </div>
                      <div className={`text-sm font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change >= 0 ? '+' : ''}{metric.change}%
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof metric.value === 'number' && metric.value % 1 !== 0 ? metric.value.toFixed(1) : metric.value}
                        {metric.name === 'System Uptime' && '%'}
                        {metric.name === 'Storage Used' && ' GB'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{metric.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Classes & Announcements */}
            <div className="lg:col-span-2 space-y-6">
              {/* Classes Section */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen size={20} /> My Classes
                  </h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Filter classes">
                      <Filter size={16} className="text-gray-600" />
                    </button>
                    <button 
                      onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Change view"
                    >
                      <LayoutDashboard size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}`}>
                  {teacherClasses.map((cls) => (
                    <div key={cls.id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            {cls.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{cls.subject}</p>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                          {cls.student_count} Students
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Attendance</p>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${cls.current_attendance}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{cls.current_attendance}%</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Performance</p>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${cls.performance_score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{cls.performance_score}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{cls.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{cls.room}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments Section */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileCheck size={20} /> Recent Assignments
                  </h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors">
                    View All <span>→</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {assignments.length > 0 ? assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${getStatusColor(assignment.status)}`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.subject} • {assignment.class} • Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {assignment.submissions}/{assignment.total_students}
                          </p>
                          <p className="text-xs text-gray-500">Submissions</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      No assignments found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Profile & Announcements */}
            <div className="space-y-6">
              {/* Teacher Profile Card */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{teacherProfile.full_name}</h3>
                    <p className="text-blue-100">{teacherProfile.designation}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BookMarked size={18} className="text-blue-200" />
                    <span className="text-sm">{teacherProfile.subject_taught}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <School size={18} className="text-blue-200" />
                    <span className="text-sm">{teacherProfile.department}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-blue-200" />
                    <span className="text-sm truncate">{teacherProfile.email_address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-blue-200" />
                    <span className="text-sm">{teacherProfile.contact_number}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-blue-400/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-200">EC Number</p>
                      <p className="font-bold">{teacherProfile.ec_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-200">Since</p>
                      <p className="font-bold">
                        {new Date(teacherProfile.date_of_appointment).getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Bell size={20} /> Announcements
                </h2>

                <div className="space-y-4">
                  {announcements.length > 0 ? announcements.map((announcement) => (
                    <div 
                      key={announcement.id} 
                      className={`p-4 border rounded-xl ${getPriorityColor(announcement.priority)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{announcement.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm mb-3 line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{announcement.author}</span>
                        <span>{new Date(announcement.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-500">
                      No announcements.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp size={20} /> This Week
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Upload size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Files Uploaded</p>
                        <p className="text-sm text-gray-600">This week: {uploadedFiles.filter(f => 
                          new Date(f.upload_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ).length}</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-bold">+24%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Download size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Downloads</p>
                        <p className="text-sm text-gray-600">This week: 142</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-bold">+18%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <MessageSquare size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Messages</p>
                        <p className="text-sm text-gray-600">Unread: 3</p>
                      </div>
                    </div>
                    <span className="text-blue-600 font-bold">Reply</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Upload New Resource</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleFileUpload} className="p-6">
              <div className="space-y-6">
                {/* Upload Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Resource Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["material", "assignment", "syllabus", "notes", "timetable", "marks"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUploadType(type)}
                        className={`p-4 rounded-xl border-2 text-sm font-medium transition-all capitalize flex flex-col items-center gap-2 ${
                          uploadType === type
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {type === "material" && <FileText size={20} />}
                        {type === "assignment" && <FileCheck size={20} />}
                        {type === "syllabus" && <BookMarked size={20} />}
                        {type === "notes" && <NotebookPen size={20} />}
                        {type === "timetable" && <CalendarRange size={20} />}
                        {type === "marks" && <FileBarChart size={20} />}
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select File
                  </label>
                  <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors bg-gray-50/50">
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                      required
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-700 font-semibold text-lg mb-2">
                        {uploadFile ? uploadFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Max file size: 100MB • Supports: PDF, DOC, XLS, PPT, Images, Videos
                      </p>
                      {uploadFile && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Ready to upload: {formatFileSize(uploadFile.size)}
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Trigonometry Worksheet"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={uploadSubject || teacherProfile.subject_taught}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                    placeholder="Describe the content, learning objectives, and any important instructions..."
                  />
                </div>

                {/* Target Classes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Target Classes *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {teacherClasses.map((cls) => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setSelectedClasses(prev =>
                            prev.includes(cls.id)
                              ? prev.filter(id => id !== cls.id)
                              : [...prev, cls.id]
                          );
                        }}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedClasses.includes(cls.id)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <Users size={14} />
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date for Assignments */}
                {uploadType === "assignment" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                )}

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Access Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["public", "private", "restricted"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setAccessLevel(level)}
                        className={`p-4 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                          accessLevel === level
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-8 py-3.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-10 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-md hover:shadow-blue-200"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload Resource
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}