import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../store/AuthContext';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  TrendingUp, 
  Sparkles, 
  UserPlus, 
  Download, 
  ShieldCheck, 
  ArrowUpRight, 
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface DemographicsData {
  gender: { name: string; value: number }[];
  year: { name: string; value: number }[];
  blood: { name: string; value: number }[];
}

interface EnrollmentTrendData {
  period: string;
  count: number;
}

interface DepartmentData {
  name: string;
  count: number;
  fullName: string;
}

export default function Dashboard({ 
  onNavigate 
}: { 
  onNavigate: (tab: string, studentId?: number) => void 
}) {
  const { user, departments, settings, showToast } = useAuth();
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [activeStudents, setActiveStudents] = useState<number>(0);
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentTrendData[]>([]);
  const [deptData, setDeptData] = useState<DepartmentData[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // 1. Get raw students to aggregate totals
        const studentsResp = await api.get<{ students: any[], pagination: any }>('/api/students?limit=200');
        setTotalStudents(studentsResp.pagination.total);
        setActiveStudents(studentsResp.students.filter(s => s.status === 'Active').length);

        // 2. Load demographic breakdown
        const demoData = await api.get<DemographicsData>('/api/reports/demographics');
        setDemographics(demoData);

        // 3. Load enrollment curves
        const trendData = await api.get<EnrollmentTrendData[]>('/api/reports/enrollments');
        setEnrollments(trendData);

        // 4. Load department distribution
        const departmentData = await api.get<DepartmentData[]>('/api/reports/departments');
        setDeptData(departmentData);

        // 5. Load recent audit activity trail
        if (user?.role === 'Admin') {
          const logs = await api.get<any[]>('/api/system/logs');
          setRecentLogs(logs.slice(0, 5));
        }
      } catch (err: any) {
        showToast('Failed to sync complete dashboard analytics.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const COLORS = ['#FACC15', '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-6 font-sans">
      {/* Banner Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#121212] p-6 rounded-xl border border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/20">
              Administrative Command Center
            </span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
              <Clock className="h-3 w-3" /> Live Sync Active
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            System Overview
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Running at <span className="text-zinc-300 font-semibold">{settings['school_name'] || 'SMS Institute of Technology'}</span>.
          </p>
        </div>

        <div className="flex gap-2">
          {user?.role !== 'Viewer' && (
            <button
              onClick={() => onNavigate('student-create')}
              className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(250,204,21,0.15)] active:scale-95"
            >
              <UserPlus className="h-4 w-4" /> Enroll Student
            </button>
          )}
          <a
            href="/api/reports/export/csv"
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-medium text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" /> Export Ledger (CSV)
          </a>
        </div>
      </div>

      {/* Stats Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-zinc-800 p-5 rounded-xl shadow-sm relative group hover:border-zinc-700 transition-all">
          <div className="absolute right-4 top-4 bg-zinc-900 p-2 rounded-xl text-zinc-400 group-hover:text-yellow-400 transition-all">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Enrolled</p>
          <p className="text-3xl font-bold text-white mt-2 font-mono">
            {isLoading ? '---' : totalStudents}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-green-400 mt-3 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>+100% cloud lifetime data</span>
          </div>
        </div>

        <div className="bg-[#121212] border border-zinc-800 p-5 rounded-xl shadow-sm relative group hover:border-zinc-700 transition-all">
          <div className="absolute right-4 top-4 bg-zinc-900 p-2 rounded-xl text-zinc-400 group-hover:text-green-400 transition-all">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Active Students</p>
          <p className="text-3xl font-bold text-white mt-2 font-mono">
            {isLoading ? '---' : activeStudents}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-3 font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>In active study cycle</span>
          </div>
        </div>

        <div className="bg-[#121212] border border-zinc-800 p-5 rounded-xl shadow-sm relative group hover:border-zinc-700 transition-all">
          <div className="absolute right-4 top-4 bg-zinc-900 p-2 rounded-xl text-zinc-400 group-hover:text-blue-400 transition-all">
            <Building2 className="h-5 w-5" />
          </div>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Academic Faculties</p>
          <p className="text-3xl font-bold text-white mt-2 font-mono">
            {departments.length}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-3">
            <span>Specialized branches configured</span>
          </div>
        </div>

        <div className="bg-[#121212] border border-zinc-800 p-5 rounded-xl shadow-sm relative group hover:border-zinc-700 transition-all">
          <div className="absolute right-4 top-4 bg-zinc-900 p-2 rounded-xl text-zinc-400 group-hover:text-pink-400 transition-all">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Institutional Role</p>
          <p className="text-lg font-bold text-yellow-400 mt-2">
            {user?.role === 'Admin' ? 'Administrator' : user?.role === 'Staff' ? 'Staff Registrar' : 'Auditor (Viewer)'}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-4">
            <span>Authenticated as {user?.fullName}</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Area: Charts & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Temporal Enrollment Trend Chart (2 columns span) */}
        <div className="lg:col-span-2 bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-400" />
                Enrollment Trends
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Institutional cumulative registrations over active semesters</p>
            </div>
            <div className="bg-zinc-800/40 text-[11px] font-mono text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-800">
              Periodic Metrics
            </div>
          </div>

          <div className="h-64 w-full">
            {enrollments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollments} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                  <XAxis 
                    dataKey="period" 
                    stroke="#52525b" 
                    fontSize={11} 
                    fontFamily="JetBrains Mono, monospace"
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={11} 
                    fontFamily="JetBrains Mono, monospace" 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#FACC15" 
                    strokeWidth={3} 
                    dot={{ fill: '#FACC15', stroke: '#09090b', strokeWidth: 2, r: 5 }} 
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                <p className="text-xs">No active registrations parsed yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Faculty Department Distribution Chart */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Layers className="h-4 w-4 text-yellow-400" />
              Faculty Distribution
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Student registration weight by department ratio</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative my-4">
            {deptData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData.filter(d => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    formatter={(value, name, props) => [`${value} Students`, props.payload.fullName]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-zinc-500 text-xs">No department associations yet.</div>
            )}
            
            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Total Ratio</span>
              <span className="text-2xl font-bold font-mono text-zinc-100">{totalStudents}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 mt-2">
            {deptData.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="font-semibold text-zinc-300 font-mono">{d.name}:</span>
                <span>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Bento panels & Audit Logs trail for Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Action Shortcuts Card */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" /> Administrative Routines
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('students')}
              className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl hover:border-yellow-400/20 text-left transition-all active:scale-95"
            >
              <div className="text-yellow-400 font-bold text-xs">Directory</div>
              <div className="text-[10px] text-zinc-500 mt-1">Search, Filter, Export Ledger</div>
            </button>

            {user?.role !== 'Viewer' && (
              <button
                onClick={() => onNavigate('student-create')}
                className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl hover:border-yellow-400/20 text-left transition-all active:scale-95"
              >
                <div className="text-yellow-400 font-bold text-xs">Register Profile</div>
                <div className="text-[10px] text-zinc-500 mt-1">Create Student Records</div>
              </button>
            )}

            <button
              onClick={() => onNavigate('analytics')}
              className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl hover:border-yellow-400/20 text-left transition-all active:scale-95"
            >
              <div className="text-yellow-400 font-bold text-xs">Analytics</div>
              <div className="text-[10px] text-zinc-500 mt-1">Faculties & trends reports</div>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl hover:border-yellow-400/20 text-left transition-all active:scale-95"
            >
              <div className="text-yellow-400 font-bold text-xs">System Options</div>
              <div className="text-[10px] text-zinc-500 mt-1">Restore/Backup DB, User accounts</div>
            </button>
          </div>
        </div>

        {/* Audit Logs trail - visible to Admin only */}
        {user?.role === 'Admin' ? (
          <div className="lg:col-span-2 bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-yellow-400" /> Recent Audit Activity
              </h3>
              <button 
                onClick={() => onNavigate('settings')}
                className="text-[11px] text-yellow-400 hover:underline"
              >
                View Complete Log
              </button>
            </div>

            <div className="space-y-2.5 flex-1">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 font-mono text-[11px] text-zinc-400">
                    <div className="flex items-center gap-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        log.action === 'CREATE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        log.action === 'DELETE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-zinc-200">{log.userName}</span>
                      <span>modifed {log.entity}</span>
                    </div>
                    <span className="text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500 py-6">
                  No administrative logs parsed yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-[#121212] border border-zinc-800 p-6 rounded-xl flex flex-col justify-center items-center text-center shadow-sm">
            <Building2 className="h-10 w-10 text-zinc-600 mb-2" />
            <h4 className="text-xs font-bold text-zinc-400">Restricted Audit Area</h4>
            <p className="text-[11px] text-zinc-500 max-w-xs mt-1">
              Full relational audit database triggers and activity trails are strictly restricted to Administrator credentials.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
