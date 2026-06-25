import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../store/AuthContext';
import { 
  TrendingUp, 
  Download, 
  Printer, 
  BarChart3, 
  PieChart as PieIcon, 
  Sparkles,
  Layers,
  HeartPulse,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

interface DemographicsData {
  gender: { name: string; value: number }[];
  year: { name: string; value: number }[];
  blood: { name: string; value: number }[];
}

interface DepartmentData {
  name: string;
  count: number;
  fullName: string;
}

export default function Analytics() {
  const { settings, showToast } = useAuth();
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [demoData, deptData] = await Promise.all([
          api.get<DemographicsData>('/api/reports/demographics'),
          api.get<DepartmentData[]>('/api/reports/departments'),
        ]);
        setDemographics(demoData);
        setDepartments(deptData);
      } catch (err: any) {
        showToast('Failed to pull analytical demographics.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const COLORS = ['#FACC15', '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'];

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !demographics) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs gap-2">
        <span>Compiling Institutional Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans print:p-8 print:bg-white print:text-black" id="analytics-board">
      
      {/* Header Visual banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#121212] p-6 rounded-xl border border-zinc-800 shadow-sm print:hidden">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/20">
            Demographic Metrics Ledger
          </span>
          <h1 className="text-2xl font-black text-white mt-2">Dossier Reports & Analytics</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Institutional metrics mapped to academic year, gender representation, and faculty ratios.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-medium text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Dossier
          </button>
          <a
            href="/api/reports/export/csv"
            className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <Download className="h-4 w-4" /> Export CSV Ledger
          </a>
        </div>
      </div>

      {/* Main Print Layout Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-black border-b pb-3">Student Management System Analytics Report</h1>
        <p className="text-sm mt-2 text-zinc-600 font-mono">
          School Name: {settings['school_name'] || 'SMS Institute of Technology'} | Generated at: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Analytics Charts Bento Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Year-Wise Student distribution */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm flex flex-col justify-between print:border-zinc-300 print:bg-white print:text-black">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 print:text-black">
              <BarChart3 className="h-4 w-4 text-yellow-400" /> Academic Cohort Distribution
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Student volume categorized by registered curriculum year</p>
          </div>

          <div className="h-56 w-full font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics.year}>
                <XAxis dataKey="name" stroke="#52525b" />
                <YAxis stroke="#52525b" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#FACC15" radius={[4, 4, 0, 0]}>
                  {demographics.year.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Gender splits ratios */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm flex flex-col justify-between print:border-zinc-300 print:bg-white print:text-black">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 print:text-black">
              <PieIcon className="h-4 w-4 text-yellow-400" /> Gender Ratios
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Gender split representation across active students</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographics.gender}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {demographics.gender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} />
                <Legend formatter={(value, entry, index) => <span className="text-[11px] text-zinc-400">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>

            {/* Total Indicator label inside Pie Ring */}
            <div className="absolute inset-y-0 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Enrollment</span>
              <span className="text-xl font-bold font-mono text-zinc-100 print:text-black">
                {demographics.gender.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Chart 3: Department breakdown */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm flex flex-col justify-between print:border-zinc-300 print:bg-white print:text-black">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 print:text-black">
              <Layers className="h-4 w-4 text-yellow-400" /> Faculty Department Count
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Cumulative student enrollment headcount by department faculty</p>
          </div>

          <div className="h-56 w-full font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments.filter(d => d.count > 0)}>
                <XAxis dataKey="name" stroke="#52525b" />
                <YAxis stroke="#52525b" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#FACC15" radius={[4, 4, 0, 0]}>
                  {departments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Blood groups mapping */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm flex flex-col justify-between print:border-zinc-300 print:bg-white print:text-black">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 print:text-black">
              <HeartPulse className="h-4 w-4 text-yellow-400" /> Physical Health Blood Index
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Critical blood group mapping distribution index for emergency reference</p>
          </div>

          <div className="h-56 w-full font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics.blood}>
                <XAxis dataKey="name" stroke="#52525b" />
                <YAxis stroke="#52525b" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#FACC15" radius={[4, 4, 0, 0]}>
                  {demographics.blood.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
