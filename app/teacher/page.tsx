"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BookOpen, Upload, FileText, PlusCircle, 
  CheckCircle, ShieldAlert, Loader2, Calendar,
  Trash2, Download, ExternalLink
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TeacherTerminal() {
  const [profile, setProfile] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getTeacherData() {
      // 1. Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Fetch the detailed profile
      const { data: prof } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (prof) {
        setProfile(prof);
        // 3. If approved, fetch resources they have published
        if (prof.is_approved) {
          fetchResources(user.id);
        }
      }
    }
    getTeacherData();
  }, []);

  async function fetchResources(teacherId: string) {
    const { data: res } = await supabase
      .from('academic_resources')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    
    setResources(res || []);
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const newResource = {
      teacher_id: profile.id,
      title: formData.get('title'),
      subject: profile.subject_taught,
      target_class: formData.get('class'),
      resource_type: formData.get('type'), // 'assignment' or 'handout'
      due_date: formData.get('due_date') || null,
      created_at: new Date().toISOString()
    };

    const { error: uploadError } = await supabase
      .from('academic_resources')
      .insert([newResource]);

    if (!uploadError) {
       fetchResources(profile.id);
       (e.target as HTMLFormElement).reset();
    } else {
       setError(uploadError.message);
    }
    setUploading(false);
  };

  const deleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to remove this resource?")) return;
    const { error } = await supabase.from('academic_resources').delete().eq('id', id);
    if (!error) fetchResources(profile.id);
  };

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="font-black italic text-slate-400 uppercase tracking-widest text-sm">Verifying Credentials...</p>
      </div>
    </div>
  );

  // ACCESS DENIED VIEW
  if (!profile.is_approved) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-10 text-center">
      <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 max-w-lg">
        <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4 text-slate-900 leading-none">
          Approval <span className="text-orange-600">Pending</span>
        </h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] leading-relaxed">
          Your staff account is currently inactive. The System Administrator must verify your role before you can publish academic resources.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 space-y-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Detema Secondary School</p>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Teacher <span className="text-blue-600">Terminal</span>
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">
              Dept: {profile.subject_taught}
            </span>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              {profile.full_name}
            </span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* PUBLISH FORM */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl h-fit sticky top-12">
          <h2 className="text-sm font-black uppercase italic mb-8 flex items-center gap-2 text-slate-900">
            <PlusCircle size={18} className="text-blue-600"/> Publish New Content
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Content Type</label>
              <select name="type" className="w-full p-5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-blue-600 appearance-none">
                <option value="assignment">ASSIGNMENT (Has Deadline)</option>
                <option value="handout">STUDY HANDOUT (Notes)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Resource Title</label>
              <input name="title" placeholder="e.g. Algebra Introduction" className="w-full p-5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-blue-600" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Target Class</label>
              <input name="class" placeholder="e.g. Form 3B" className="w-full p-5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-blue-600" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Submission Deadline (Optional)</label>
              <input type="date" name="due_date" className="w-full p-5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-blue-600 text-slate-500" />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                <ShieldAlert size={14} /> {error}
              </div>
            )}

            <button 
              disabled={uploading} 
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
              {uploading ? "Publishing..." : "Sync to Student Portal"}
            </button>
          </form>
        </div>

        {/* FEED OF PUBLISHED CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black uppercase italic text-slate-400 tracking-widest">Active Content Feed</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{resources.length} Total Items</span>
          </div>

          {resources.map((res) => (
            <div key={res.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-2 h-full ${res.resource_type === 'assignment' ? 'bg-orange-500' : 'bg-blue-600'}`} />
              
              <div className="flex items-center gap-6 w-full">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg ${res.resource_type === 'assignment' ? 'bg-orange-500' : 'bg-blue-600'}`}>
                  {res.resource_type === 'assignment' ? <FileText size={28}/> : <BookOpen size={28}/>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{res.target_class}</span>
                    <span className="text-slate-200">•</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{res.resource_type}</span>
                  </div>
                  <h3 className="font-black text-slate-900 uppercase text-xl italic leading-none">{res.title}</h3>
                  {res.due_date && (
                    <p className="text-[10px] font-bold text-orange-600 uppercase mt-2 flex items-center gap-1">
                      <Calendar size={12}/> Due: {res.due_date}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">
                  <ExternalLink size={20} />
                </button>
                <button 
                  onClick={() => deleteResource(res.id)}
                  className="flex-1 md:flex-none p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {resources.length === 0 && (
            <div className="p-32 text-center border-4 border-dashed border-slate-100 rounded-[4rem]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-black italic uppercase text-sm tracking-widest">
                  You haven't published anything yet
              </p>
              <p className="text-slate-300 text-[10px] font-bold uppercase mt-2">Use the form to upload your first assignment or handout</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}