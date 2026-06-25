import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../store/AuthContext';
import { Student, Department, Document, ActivityLog } from '../../types';
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  User, 
  BookOpen, 
  FileText, 
  History, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Paperclip,
  Trash2,
  Download,
  AlertCircle,
  Clock,
  Loader2,
  Camera
} from 'lucide-react';

export default function StudentProfile({ 
  studentId, 
  onNavigate 
}: { 
  studentId: number; 
  onNavigate: (tab: string, studentId?: number) => void 
}) {
  const { user, departments, showToast } = useAuth();
  
  // States
  const [profile, setProfile] = useState<Student | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'documents' | 'history'>('personal');
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editCurrentYear, setEditCurrentYear] = useState('');
  const [editStatus, setEditStatus] = useState<Student['status']>('Active');
  const [editProfilePhoto, setEditProfilePhoto] = useState('');

  // Document attachments upload states
  const [uploadDocType, setUploadDocType] = useState('TRANSCRIPT');
  const [isUploading, setIsUploading] = useState(false);

  const fetchProfileDetails = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{
        student: Student;
        department: Department | null;
        documents: Document[];
        logs: ActivityLog[];
      }>(`/api/students/${studentId}`);
      
      setProfile(data.student);
      setDepartment(data.department);
      setDocuments(data.documents);
      setLogs(data.logs);

      // Seed edit form values
      setEditFirstName(data.student.firstName);
      setEditLastName(data.student.lastName);
      setEditEmail(data.student.email);
      setEditPhone(data.student.phone || '');
      setEditDob(data.student.dob);
      setEditGender(data.student.gender);
      setEditBloodGroup(data.student.bloodGroup || '');
      setEditAddress(data.student.address || '');
      setEditCity(data.student.city || '');
      setEditCountry(data.student.country || 'India');
      setEditDeptId(String(data.student.deptId));
      setEditCurrentYear(String(data.student.currentYear));
      setEditStatus(data.student.status);
      setEditProfilePhoto(data.student.profilePhoto || '');
    } catch (err: any) {
      showToast('Failed to pull student profile details.', 'error');
      onNavigate('students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [studentId]);

  // Edit form trigger save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName || !editLastName || !editEmail) {
      showToast('First Name, Last Name and Email are mandatory fields.', 'warning');
      return;
    }

    try {
      const payload = {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        dob: editDob,
        gender: editGender,
        bloodGroup: editBloodGroup,
        address: editAddress,
        city: editCity,
        country: editCountry,
        deptId: parseInt(editDeptId),
        currentYear: parseInt(editCurrentYear),
        status: editStatus,
        profilePhoto: editProfilePhoto,
      };

      await api.put(`/api/students/${studentId}`, payload);
      showToast('Student dossier updated successfully.', 'success');
      setIsEditing(false);
      fetchProfileDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to apply updates.', 'error');
    }
  };

  // Profile photo replacement
  const handleProfilePhotoEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size cannot exceed 2MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditProfilePhoto(reader.result as string);
      showToast('New photo buffered. Please hit Save to commit.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Mock Upload Document attachment
  const handleDocumentAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const payload = {
          docType: uploadDocType,
          fileName: file.name,
          fileBase64: reader.result as string,
          fileSize: file.size,
        };

        await api.post(`/api/students/${studentId}/documents`, payload);
        showToast(`Document ${file.name} uploaded successfully.`, 'success');
        fetchProfileDetails();
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast('Failed to attach document to dossier.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentRemove = async (docId: number, name: string) => {
    if (!confirm(`Are you absolutely sure you want to remove the document "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/students/${studentId}/documents/${docId}`);
      showToast('Document detached successfully.', 'success');
      fetchProfileDetails();
    } catch (err) {
      showToast('Failed to detach document.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
        Loading Student Dossier...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* breadcrumbs header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('students')}
            className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-xs text-zinc-400">
            <span>Registry Directory</span>
            <span className="mx-2 text-zinc-600">/</span>
            <span className="font-mono text-zinc-300 font-bold">{profile.studentId}</span>
          </div>
        </div>

        {/* Action Toggle buttons */}
        {user?.role !== 'Viewer' && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-yellow-400/20 text-yellow-400 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" /> Modify Dossier
          </button>
        )}
      </div>

      {/* Main Header visual Card */}
      <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <div className="absolute -right-16 -bottom-16 w-36 h-36 rounded-full bg-yellow-400/5 blur-3xl pointer-events-none"></div>

        {/* Profile photo with instant base64 editing support inside edit mode */}
        <div className="h-24 w-24 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 relative flex items-center justify-center group">
          {isEditing ? (
            <>
              {editProfilePhoto ? (
                <img src={editProfilePhoto} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-zinc-700" />
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-zinc-200 text-[9px] transition-all cursor-pointer">
                <Camera className="h-4 w-4 mb-1 text-yellow-400" /> Replace Image
                <input type="file" accept="image/*" onChange={handleProfilePhotoEdit} className="hidden" />
              </label>
            </>
          ) : (
            profile.profilePhoto ? (
              <img src={profile.profilePhoto} referrerPolicy="no-referrer" alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-zinc-600" />
            )
          )}
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex flex-col md:flex-row items-center gap-2.5">
            <h1 className="text-2xl font-black text-white">
              {profile.firstName} {profile.lastName}
            </h1>
            
            <span className="font-mono text-xs font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 py-0.5 px-2 rounded">
              {profile.studentId}
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              profile.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
              profile.status === 'Inactive' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              profile.status === 'Graduated' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {profile.status}
            </span>
          </div>

          <p className="text-sm text-zinc-400 font-mono">
            {department?.name || 'Department Unassigned'} ({department?.code || '---'})
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 pt-1.5 text-xs text-zinc-500 font-mono">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {profile.email}
            </div>
            {profile.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {profile.phone}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Enrolled {profile.enrollmentDate}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Tab Switch Header */}
      <div className="flex border-b border-zinc-800/80 gap-1.5 font-mono text-xs select-none">
        <button
          onClick={() => setActiveTab('personal')}
          className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'personal'
              ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
              : 'border-transparent text-zinc-500 hover:text-zinc-200'
          }`}
        >
          <User className="h-3.5 w-3.5" /> Personal Information
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'academic'
              ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
              : 'border-transparent text-zinc-500 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" /> Academic Profile
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'documents'
              ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
              : 'border-transparent text-zinc-500 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> Documents Attachment ({documents.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
              : 'border-transparent text-zinc-500 hover:text-zinc-200'
          }`}
        >
          <History className="h-3.5 w-3.5" /> Audit History ({logs.length})
        </button>
      </div>

      {/* Dynamic Tab Body Renders */}
      <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm">
        
        {/* Tab 1: Personal Dossier */}
        {activeTab === 'personal' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Form Input fields */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                    required
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-100">{profile.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                    required
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-100">{profile.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none cursor-pointer"
                    required
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-100 font-mono">{profile.dob}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Gender</label>
                {isEditing ? (
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-zinc-100">{profile.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Blood Group</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-100 font-mono">{profile.bloodGroup || '---'}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email Contact</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                    required
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-100 font-mono">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-100 font-mono">{profile.phone || '---'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Full Address</label>
                {isEditing ? (
                  <textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    rows={1}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none resize-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-100">{profile.address || '---'}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-100">{profile.city || '---'}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-100">{profile.country}</p>
                )}
              </div>
            </div>

            {/* Editing Save Controls */}
            {isEditing && (
              <div className="flex gap-2 justify-end pt-4 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setEditProfilePhoto(profile.profilePhoto || ''); }}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-4 py-2 rounded-xl text-zinc-300 font-semibold text-xs cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" /> Save Edits
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: Academic Faculty Dossier */}
        {activeTab === 'academic' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Enrollment ID</label>
                <p className="text-sm font-bold text-yellow-400 font-mono tracking-tight">{profile.studentId}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Faculty Department</label>
                {isEditing ? (
                  <select
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-zinc-100">{department?.name || '---'}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Department Head</label>
                <p className="text-sm font-semibold text-zinc-100">{department?.headOfDept || '---'}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Current Study Year</label>
                {isEditing ? (
                  <select
                    value={editCurrentYear}
                    onChange={(e) => setEditCurrentYear(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-zinc-100 font-mono">{profile.currentYear} Yr</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Dossier Status</label>
                {isEditing ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                    <option value="On-Leave">On-Leave</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-zinc-100">{profile.status}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Enrollment Date</label>
                <p className="text-sm font-semibold text-zinc-100 font-mono">{profile.enrollmentDate}</p>
              </div>
            </div>

            {/* Editing Save Controls */}
            {isEditing && (
              <div className="flex gap-2 justify-end pt-4 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-4 py-2 rounded-xl text-zinc-300 font-semibold text-xs cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" /> Save Edits
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 3: Documents Attachment Repository */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            
            {/* Upload form block */}
            {user?.role !== 'Viewer' && (
              <div className="bg-zinc-950/60 p-4 border border-zinc-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20 text-yellow-400">
                    <Paperclip className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Attach Document Verification</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Attach student verification transcipts or proof PDFs.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-[11px] text-zinc-300 outline-none appearance-none cursor-pointer font-mono"
                  >
                    <option value="TRANSCRIPT">TRANSCRIPT</option>
                    <option value="ID_PROOF">ID PROOF</option>
                    <option value="RECOMMENDATION">REC LETTER</option>
                    <option value="HEALTH_CERTIFICATE">HEALTH CERT</option>
                  </select>

                  <label className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-[11px] py-2 px-3 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md select-none shrink-0">
                    {isUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin text-zinc-950" />
                    ) : (
                      'Choose File'
                    )}
                    <input type="file" accept="application/pdf,image/*" onChange={handleDocumentAttach} className="hidden" disabled={isUploading} />
                  </label>
                </div>
              </div>
            )}

            {/* List Attached Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 flex items-center justify-between group hover:border-zinc-700 transition-all">
                    <div className="flex items-center gap-3 truncate">
                      <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850 text-yellow-400 shrink-0 font-mono text-[9px] font-bold">
                        PDF
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/5 px-1.5 py-0.5 rounded border border-yellow-400/10">
                          {doc.docType}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-200 mt-1 truncate" title={doc.fileName}>
                          {doc.fileName}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                          {(doc.fileSize / 1024).toFixed(1)} KB | {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      {/* Virtual Download simulated trigger */}
                      <a
                        href={doc.filePath.startsWith('data:') ? doc.filePath : '#'}
                        download={doc.fileName}
                        onClick={() => { if(!doc.filePath.startsWith('data:')) showToast('Downloading verified dossier transcript...', 'success'); }}
                        className="p-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-all cursor-pointer"
                        title="Download ledger file"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      
                      {user?.role !== 'Viewer' && (
                        <button
                          onClick={() => handleDocumentRemove(doc.id, doc.fileName)}
                          className="p-1.5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-800 hover:border-red-900 transition-all cursor-pointer"
                          title="Detatch file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-10 text-center text-zinc-500 text-xs flex flex-col items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-zinc-700 mb-2" />
                  No verification documents are currently attached to this student dossier.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs trail */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-1">
              <div>
                <h4 className="text-xs font-bold text-zinc-300">Complete Dossier Modifications Log</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Immutable relational audit records logged automatically on this student.</p>
              </div>
            </div>

            <div className="space-y-2">
              {logs.length > 0 ? (
                logs.map((log) => {
                  let parsedChanges: any = {};
                  try {
                    parsedChanges = JSON.parse(log.changes);
                  } catch (e) {}

                  return (
                    <div key={log.id} className="p-3.5 bg-zinc-950/50 border border-zinc-850 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[10px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                            log.action === 'CREATE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-zinc-300 font-bold">{log.userName}</span>
                          <span className="text-zinc-500">at terminal {log.ipAddress}</span>
                        </div>
                        
                        {Object.keys(parsedChanges).length > 0 && (
                          <p className="text-zinc-400 text-[9px] truncate max-w-lg">
                            Changes: <span className="text-yellow-400/80">{JSON.stringify(parsedChanges)}</span>
                          </p>
                        )}
                      </div>

                      <div className="text-zinc-500 text-right text-[9px] shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No modification actions logged on this student ledger yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
