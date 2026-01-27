// app/portal/teacher/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Upload,
  FileText,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Paperclip,
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
  Lock,
  AlertCircle,
  ChevronRight,
  Menu,
  X,
  Home,
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
}

interface Student {
  id: string;
  full_name: string;
  class: string;
  roll_number: string;
}

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  student_count: number;
}

export default function TeacherPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teacherClasses, setTeacherClasses] = useState<ClassInfo[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [uploadSubject, setUploadSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [uploadType, setUploadType] = useState<"assignment" | "material" | "timetable" | "marks">("material");

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"materials" | "assignments" | "timetables" | "marks">("materials");

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // First check localStorage for teacher info
      const storedName = localStorage.getItem("teacher_name");
      const storedId = localStorage.getItem("teacher_id");
      
      if (!storedName || !storedId) {
        router.push("/portal");
        return;
      }

      // Check if user is authenticated with Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // Clear invalid session and redirect
        localStorage.removeItem("teacher_name");
        localStorage.removeItem("teacher_id");
        localStorage.removeItem("teacher_role");
        router.push("/portal");
        return;
      }

      // Verify user ID matches stored ID
      if (user.id !== storedId) {
        alert("Session mismatch. Please login again.");
        await supabase.auth.signOut();
        localStorage.clear();
        router.push("/portal");
        return;
      }

      // Get teacher profile from database
      const { data: profile, error: profileError } = await supabase
        .from("staff_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        alert("No staff profile found. Please contact administrator.");
        await supabase.auth.signOut();
        localStorage.clear();
        router.push("/portal");
        return;
      }

      if (!profile.is_approved) {
        alert("Your account is pending approval.");
        await supabase.auth.signOut();
        localStorage.clear();
        router.push("/portal");
        return;
      }

      // Set teacher info
      setTeacherName(profile.full_name || storedName);
      setTeacherId(user.id);

      // Load teacher's classes (simulated data - in production, query your classes table)
      const classes: ClassInfo[] = [
        { id: "10a", name: "Form 10A", subject: "Mathematics", student_count: 32 },
        { id: "10b", name: "Form 10B", subject: "Mathematics", student_count: 30 },
        { id: "11a", name: "Form 11A", subject: "Physics", student_count: 28 },
        { id: "11b", name: "Form 11B", subject: "Physics", student_count: 26 },
      ];
      setTeacherClasses(classes);

      // Load uploaded files from database
      await loadUploadedFiles();

      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      await supabase.auth.signOut();
      localStorage.clear();
      router.push("/portal");
    }
  };

  const loadUploadedFiles = async () => {
    try {
      if (!teacherId) return;

      // Query actual teacher_uploads table from database
      const { data: filesData, error } = await supabase
        .from("teacher_uploads")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("upload_date", { ascending: false });

      if (error) {
        console.error("Error loading files:", error);
        
        // Fallback to mock data if table doesn't exist yet
        const mockFiles: UploadedFile[] = [
          {
            id: "1",
            title: "Trigonometry Worksheet",
            description: "Practice problems for trigonometry unit",
            file_url: "/files/trigonometry.pdf",
            file_type: "pdf",
            file_size: 2.4,
            target_class: ["10a", "10b"],
            target_students: [],
            subject: "Mathematics",
            upload_date: "2024-01-15",
            due_date: "2024-01-22",
            teacher_name: teacherName,
            downloads: 24,
          },
          {
            id: "2",
            title: "Physics Lab Schedule - Term 1",
            description: "Weekly lab sessions and requirements",
            file_url: "/files/physics_lab_schedule.pdf",
            file_type: "pdf",
            file_size: 1.8,
            target_class: ["11a", "11b"],
            target_students: [],
            subject: "Physics",
            upload_date: "2024-01-10",
            teacher_name: teacherName,
            downloads: 18,
          },
        ];

        setUploadedFiles(mockFiles);
        return;
      }

      // Transform database data to match UploadedFile interface
      const formattedFiles: UploadedFile[] = filesData.map((file: any) => ({
        id: file.id,
        title: file.title,
        description: file.description || "",
        file_url: file.file_url,
        file_type: file.file_type || "application/octet-stream",
        file_size: file.file_size || 0,
        target_class: file.target_class || [],
        target_students: file.target_students || [],
        subject: file.subject || "General",
        upload_date: file.upload_date,
        due_date: file.due_date,
        teacher_name: file.teacher_name || teacherName,
        downloads: file.downloads || 0,
      }));

      setUploadedFiles(formattedFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle || !selectedClasses.length) {
      alert("Please fill all required fields");
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('teacher-uploads')
        .upload(`teacher-${teacherId}/${fileName}`, uploadFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('teacher-uploads')
        .getPublicUrl(`teacher-${teacherId}/${fileName}`);

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from("teacher_uploads")
        .insert({
          teacher_id: teacherId,
          teacher_name: teacherName,
          title: uploadTitle,
          description: uploadDescription,
          file_url: urlData.publicUrl,
          file_name: uploadFile.name,
          file_type: uploadFile.type,
          file_size: uploadFile.size,
          target_class: selectedClasses,
          subject: uploadSubject || "General",
          upload_type: uploadType,
          due_date: dueDate || null,
          upload_date: new Date().toISOString(),
          downloads: 0,
        });

      if (dbError) throw dbError;

      // Reload files
      await loadUploadedFiles();
      
      // Reset form
      setUploadTitle("");
      setUploadDescription("");
      setUploadFile(null);
      setSelectedClasses([]);
      setUploadSubject("");
      setDueDate("");
      setShowUploadModal(false);
      
      alert("File uploaded successfully!");

    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("teacher_name");
    localStorage.removeItem("teacher_id");
    localStorage.removeItem("teacher_role");
    router.push("/portal");
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      // Extract filename from URL for storage deletion
      const urlParts = fileName.split('/');
      const storageFileName = urlParts[urlParts.length - 1];
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('teacher-uploads')
        .remove([`teacher-${teacherId}/${storageFileName}`]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("teacher_uploads")
        .delete()
        .eq("id", fileId);

      if (dbError) throw dbError;

      // Reload files
      await loadUploadedFiles();
      alert("File deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting file. Please try again.");
    }
  };

  const filteredFiles = uploadedFiles.filter(file => {
    // Filter by class
    if (selectedClass !== "all" && !file.target_class.includes(selectedClass)) {
      return false;
    }
    
    // Filter by subject
    if (selectedSubject !== "all" && file.subject !== selectedSubject) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !file.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !file.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by active tab
    if (activeTab === "assignments" && !file.due_date) return false;
    if (activeTab === "marks" && !file.title.toLowerCase().includes("marks")) return false;
    if (activeTab === "timetables" && !file.title.toLowerCase().includes("schedule") && 
        !file.title.toLowerCase().includes("timetable")) return false;
    
    return true;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎬";
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "📽️";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading teacher portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/portal" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <Home size={20} />
                <span className="font-bold">Portal Home</span>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-slate-600">
                <ChevronRight size={16} />
                <span className="font-medium">Teacher Portal</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{teacherName}</p>
                <p className="text-xs text-slate-500">Teacher Account</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Upload size={16} /> Upload
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, <span className="text-blue-600">{teacherName}</span>
          </h1>
          <p className="text-slate-600">
            Manage your classes, upload materials, and track assignments.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Classes</p>
                <p className="text-2xl font-bold text-slate-900">{teacherClasses.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Uploaded Files</p>
                <p className="text-2xl font-bold text-slate-900">{uploadedFiles.length}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <FileText className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-slate-900">
                  {teacherClasses.reduce((sum, cls) => sum + cls.student_count, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Items</p>
                <p className="text-2xl font-bold text-slate-900">3</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Bell className="text-amber-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Classes & Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users size={20} /> Your Classes
              </h2>
              
              <div className="space-y-2 mb-6">
                {teacherClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(selectedClass === cls.id ? "all" : cls.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedClass === cls.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-900">{cls.name}</p>
                        <p className="text-sm text-slate-500">{cls.subject}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-full">
                        {cls.student_count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Filter size={16} /> Filter by Subject
                </h3>
                <div className="space-y-2">
                  {["all", ...Array.from(new Set(teacherClasses.map(c => c.subject)))].map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`w-full text-left p-2 rounded-lg text-sm ${
                        selectedSubject === subject
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {subject === "all" ? "All Subjects" : subject}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab("assignments");
                      setShowUploadModal(true);
                      setUploadType("assignment");
                    }}
                    className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <p className="font-semibold text-amber-900">Create Assignment</p>
                    <p className="text-xs text-amber-700">Set new assignment with deadline</p>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("marks");
                      setShowUploadModal(true);
                      setUploadType("marks");
                    }}
                    className="w-full text-left p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <p className="font-semibold text-emerald-900">Upload Marks</p>
                    <p className="text-xs text-emerald-700">Upload exam/test results</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Tabs and Search */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                  {(["materials", "assignments", "timetables", "marks"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                        activeTab === tab
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Files Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {file.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">{file.subject} • {file.target_class.join(", ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.file_url)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{file.description}</p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{file.downloads} downloads</span>
                        {file.due_date && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-semibold flex items-center gap-1">
                              <Clock size={12} /> Due: {new Date(file.due_date).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock size={12} className="text-emerald-600" />
                        <span>Secure</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          Uploaded {new Date(file.upload_date).toLocaleDateString()}
                        </div>
                        <a
                          href={file.file_url}
                          download
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Download size={14} /> Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFiles.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No files found</h3>
                  <p className="text-slate-500 mb-6">
                    {searchQuery ? "Try a different search term" : "Upload your first file to get started"}
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Upload size={16} /> Upload File
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium text-slate-900">Trigonometry Worksheet uploaded</p>
                    <p className="text-sm text-slate-500">2 hours ago • Viewed by 24 students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                  <Clock className="text-amber-600" size={20} />
                  <div>
                    <p className="font-medium text-slate-900">Physics Lab Schedule updated</p>
                    <p className="text-sm text-slate-500">Yesterday • Due in 3 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Upload New File</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleFileUpload} className="p-6">
              <div className="space-y-6">
                {/* Upload Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(["material", "assignment", "timetable", "marks"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUploadType(type)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all capitalize ${
                          uploadType === type
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {type === "material" ? "Study Material" : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select File
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 font-medium mb-2">
                        {uploadFile ? uploadFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Max file size: 50MB • Supported: PDF, DOC, XLS, PPT, JPG, PNG
                      </p>
                    </label>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Trigonometry Worksheet"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="Describe the content and any important instructions..."
                  />
                </div>

                {/* Target Classes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedClasses.includes(cls.id)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date for Assignments */}
                {uploadType === "assignment" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload File
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