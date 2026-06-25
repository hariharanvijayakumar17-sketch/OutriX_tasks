import React, { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../store/AuthContext';
import { 
  UserPlus, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Calendar, 
  Camera, 
  Loader2,
  Sparkles
} from 'lucide-react';

export default function StudentCreate({ 
  onNavigate 
}: { 
  onNavigate: (tab: string, studentId?: number) => void 
}) {
  const { departments, showToast } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [deptId, setDeptId] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().substring(0, 10));
  const [currentYear, setCurrentYear] = useState('1');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Graduated' | 'On-Leave'>('Active');
  const [profilePhoto, setProfilePhoto] = useState('');

  // Handle Photo Attachment as a Base64 string
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Only image files (JPG, PNG) are permitted.', 'warning');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Maximum image size is capped at 2MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(reader.result as string);
      showToast('Profile photo attached successfully.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side Validations
    if (!firstName || !lastName || !email || !dob || !deptId || !enrollmentDate) {
      showToast('Please fill in all mandatory form fields.', 'warning');
      return;
    }

    // Email pattern validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please provide a structurally valid email address.', 'warning');
      return;
    }

    // Dob is in the past
    if (new Date(dob) >= new Date()) {
      showToast('Date of birth must be a past date.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        dob,
        gender,
        bloodGroup,
        address,
        city,
        country,
        deptId: parseInt(deptId),
        enrollmentDate,
        currentYear: parseInt(currentYear),
        status,
        profilePhoto,
      };

      const student = await api.post<any>('/api/students', payload);
      showToast(`Student dossier for ${firstName} registered successfully!`, 'success');
      
      // Navigate straight to the newly minted student profile dossier
      onNavigate('student-profile', student.id);
    } catch (err: any) {
      showToast(err.message || 'An error occurred during student registration.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('students')}
          className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-white">Enroll Student Profile</h1>
          <p className="text-zinc-500 text-xs mt-1">Register a new academic record with secure institutional validation.</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area: Form details bento grids */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Personal Dossier */}
          <div className="bg-[#121212] border border-zinc-800 p-5 rounded-xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800/60 pb-3">
              <User className="h-4 w-4 text-yellow-400" /> Personal Identity details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Aarav"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/10 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Sharma"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/10 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Blood Group</label>
                <input
                  type="text"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  placeholder="e.g. O+"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:border-yellow-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="bg-[#121212] border border-zinc-800 p-5 rounded-xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800/60 pb-3">
              <Mail className="h-4 w-4 text-yellow-400" /> Contact & Location Coordinates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student.name@sms.edu"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:border-yellow-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Full Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, Building number..."
                  rows={2}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:border-yellow-400 outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:border-yellow-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:border-yellow-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Academics and Photo uploads */}
        <div className="space-y-6">
          
          {/* Section 3: Photo Dossier */}
          <div className="bg-[#121212] border border-zinc-800 p-5 rounded-xl text-center shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800/60 pb-3 text-left">
              <Camera className="h-4 w-4 text-yellow-400" /> Profile Graphic
            </h2>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="h-28 w-28 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden relative flex items-center justify-center group">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-zinc-700" />
                )}
                
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-zinc-200 text-[10px] font-semibold transition-all cursor-pointer">
                  <Camera className="h-5 w-5 mb-1 text-yellow-400" />
                  Upload Image
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              <p className="text-[10px] text-zinc-500 mt-3 leading-relaxed">
                Supports JPG, PNG up to 2MB. Attached images will instantly sync to the ledger database.
              </p>
            </div>
          </div>

          {/* Section 4: Academic Dossier */}
          <div className="bg-[#121212] border border-zinc-800 p-5 rounded-xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800/60 pb-3">
              <BookOpen className="h-4 w-4 text-yellow-400" /> Faculty & Academics
            </h2>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Faculty Department *</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                required
              >
                <option value="">Select Faculty...</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Academic Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Enrollment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                  <option value="On-Leave">On-Leave</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1.5">Enrollment Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                <input
                  type="date"
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none cursor-pointer"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="w-1/2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-yellow-500/5 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  Enrolling...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Register Student
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
