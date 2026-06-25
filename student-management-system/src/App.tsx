import React, { useState } from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import StudentList from './pages/students/StudentList';
import StudentCreate from './pages/students/StudentCreate';
import StudentProfile from './pages/students/StudentProfile';
import Analytics from './pages/reports/Analytics';
import SystemSettings from './pages/settings/SystemSettings';
import About from './pages/about/About';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings, 
  Info, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  Clock,
  Loader2
} from 'lucide-react';

function DashboardLayout() {
  const { user, logout, toasts, dismissToast, settings } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // High-fidelity tab navigator trigger
  const handleNavigate = (tab: string, studentId?: number) => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
    setActiveTab(tab);
    setMobileMenuOpen(false); // Close mobile tray on transition
  };

  // Render proper sub-page
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'students':
        return <StudentList onNavigate={handleNavigate} />;
      case 'student-create':
        return <StudentCreate onNavigate={handleNavigate} />;
      case 'student-profile':
        return selectedStudentId ? (
          <StudentProfile studentId={selectedStudentId} onNavigate={handleNavigate} />
        ) : (
          <StudentList onNavigate={handleNavigate} />
        );
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SystemSettings />;
      case 'about':
        return <About />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  // Sidebar Links config based on role security clearance
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Directory', icon: Users },
    ...(user?.role !== 'Viewer' ? [{ id: 'student-create', label: 'Enroll Student', icon: UserPlus }] : []),
    { id: 'analytics', label: 'Dossier Reports', icon: BarChart3 },
    { id: 'settings', label: 'System Admin', icon: Settings },
    { id: 'about', label: 'System Specifications', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex font-sans relative">
      
      {/* Absolute floating Toast Notification alert engine */}
      <div className="fixed top-5 right-5 z-50 space-y-2 max-w-sm w-full font-sans print:hidden">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className={`p-4 rounded-xl shadow-2xl border backdrop-blur-md cursor-pointer transition-all duration-300 transform translate-y-0 scale-100 hover:scale-[1.02] flex items-start gap-3 ${
              toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-zinc-900/90 border-zinc-800 text-zinc-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <XCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Bell className="h-5 w-5 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
            </div>
            <button className="text-[10px] opacity-40 hover:opacity-100 font-mono font-bold shrink-0">DISMISS</button>
          </div>
        ))}
      </div>

      {/* PERSISTENT DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#121212] border-r border-zinc-800 p-6 shrink-0 justify-between select-none print:hidden">
        <div className="space-y-6">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 bg-[#FACC15] rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-black rotate-45"></div>
            </div>
            <span className="font-bold text-xl tracking-tight italic text-white">
              SMS<span className="text-[#FACC15] not-italic font-black">PRO</span>
            </span>
          </div>

          {/* User authenticated session info Card */}
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-[#FACC15] font-mono shrink-0">
              {user?.fullName[0].toUpperCase()}
            </div>
            <div className="truncate flex-1 overflow-hidden">
              <h4 className="text-sm font-medium text-zinc-100 truncate">{user?.fullName}</h4>
              <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                user?.role === 'Admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                user?.role === 'Staff' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Nav links list */}
          <nav className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Main Menu</div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'students' && activeTab === 'student-profile');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-[#FACC15] font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secure session logout button footer */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-all w-full text-left cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" /> Secure Sign Out
        </button>
      </aside>

      {/* MOBILE HEADER BAR & COLLAPSED TRAY */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#121212] border-b border-zinc-800 z-40 px-4 flex items-center justify-between backdrop-blur-md print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-[#FACC15] rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-black rotate-45"></div>
          </div>
          <span className="text-sm font-black tracking-tight text-white italic">SMS<span className="text-[#FACC15] not-italic">PRO</span></span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Slide list */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#121212] z-30 p-5 flex flex-col justify-between font-sans print:hidden animate-fade-in border-b border-zinc-850">
          <div className="space-y-6">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'students' && activeTab === 'student-profile');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-[#FACC15]'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold text-zinc-400 hover:text-red-400 transition-all border border-zinc-800"
          >
            <LogOut className="h-5 w-5" /> Secure Sign Out
          </button>
        </div>
      )}

      {/* MAIN SCREEN CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        
        {/* Desktop Top Status ribbon */}
        <header className="hidden lg:flex h-16 border-b border-zinc-800 px-8 items-center justify-between select-none shrink-0 bg-[#0a0a0a] print:hidden">
          <div className="text-xs text-zinc-500 font-mono font-bold flex items-center gap-2">
            <span>IIT CAMPUS CENTRAL DATABASE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-zinc-600">|</span>
            <span>ACADEMIC YEAR: {settings ? settings['academic_year'] || '2026-2027' : '2026-2027'}</span>
          </div>

          <div className="text-xs text-zinc-400 flex items-center gap-3 font-mono">
            <span>Logged as <span className="text-[#FACC15] font-semibold">{user?.fullName}</span></span>
            <span className="text-zinc-700">|</span>
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Live UTC
            </span>
          </div>
        </header>

        {/* Scrollable workspace canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0">
          {renderActivePage()}
        </div>
      </main>
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center font-mono text-xs text-zinc-500 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
        Validating Cryptographic Session...
      </div>
    );
  }

  return isAuthenticated ? <DashboardLayout /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
