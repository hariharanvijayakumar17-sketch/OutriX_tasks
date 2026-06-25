import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../store/AuthContext';
import { Student } from '../../types';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Download,
  GraduationCap, 
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';

export default function StudentList({ 
  onNavigate 
}: { 
  onNavigate: (tab: string, studentId?: number) => void 
}) {
  const { user, departments, showToast } = useAuth();
  
  // States for query list
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deptId, setDeptId] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState('studentId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search string input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // Trigger search whenever any filter query changes
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        search: debouncedSearch,
        deptId,
        year,
        status,
        sortBy,
        sortOrder,
        page: String(page),
        limit: String(limit),
      });

      const response = await api.get<{ students: Student[], pagination: any }>(`/api/students?${query.toString()}`);
      setStudents(response.students);
      setTotalStudents(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      showToast('Failed to fetch students. System database offline.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [debouncedSearch, deptId, year, status, sortBy, sortOrder, page, limit]);

  // Column header sorter trigger
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Soft Delete student handler (Admin only)
  const handleDeleteStudent = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation(); // Avoid triggering row click detail navigation
    if (!confirm(`Are you absolutely sure you want to archive/soft-delete ${name}'s student profile?`)) {
      return;
    }

    try {
      await api.delete(`/api/students/${id}`);
      showToast(`Student ${name} successfully soft-deleted/archived.`, 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to soft delete student.', 'error');
    }
  };

  // Status Styling Utilities
  const getStatusBadge = (s: Student['status']) => {
    switch (s) {
      case 'Active':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'Inactive':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'Graduated':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'On-Leave':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Student Registry Directory
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Browse registered student dossiers, update records, and filter directories.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {user?.role !== 'Viewer' && (
            <button
              onClick={() => onNavigate('student-create')}
              className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(250,204,21,0.15)] cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Student
            </button>
          )}

          <a
            href={`/api/reports/export/csv?search=${debouncedSearch}&deptId=${deptId}&year=${year}&status=${status}`}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-medium text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all w-full md:w-auto justify-center"
          >
            <Download className="h-4 w-4" /> Download CSV
          </a>
        </div>
      </div>

      {/* Filter and Query controls Bento box */}
      <div className="bg-[#121212] border border-zinc-800 p-5 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Omni search field with Ctrl+K focus highlight hint */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, Email, Student ID, City..."
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-zinc-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition-all outline-none"
            />
          </div>

          {/* Department Faculty filter */}
          <div className="relative">
            <select
              value={deptId}
              onChange={(e) => { setDeptId(e.target.value); setPage(1); }}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-300 focus:border-yellow-400 outline-none appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
          </div>

          {/* Academic Year and Status filter */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <select
                value={year}
                onChange={(e) => { setYear(e.target.value); setPage(1); }}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-300 focus:border-yellow-400 outline-none appearance-none cursor-pointer"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-300 focus:border-yellow-400 outline-none appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="On-Leave">On-Leave</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Ledger Table */}
      <div className="bg-[#121212] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/20 text-zinc-400 uppercase text-[10px] tracking-wider font-mono select-none">
                <th className="py-4 px-5 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('studentId')}>
                  <div className="flex items-center gap-1">
                    Student ID
                    {sortBy === 'studentId' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 text-yellow-400" /> : <ChevronDown className="h-3 w-3 text-yellow-400" />)}
                  </div>
                </th>
                <th className="py-4 px-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('firstName')}>
                  <div className="flex items-center gap-1">
                    Full Name
                    {sortBy === 'firstName' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 text-yellow-400" /> : <ChevronDown className="h-3 w-3 text-yellow-400" />)}
                  </div>
                </th>
                <th className="py-4 px-4 font-semibold">Department</th>
                <th className="py-4 px-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('currentYear')}>
                  <div className="flex items-center gap-1">
                    Year
                    {sortBy === 'currentYear' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 text-yellow-400" /> : <ChevronDown className="h-3 w-3 text-yellow-400" />)}
                  </div>
                </th>
                <th className="py-4 px-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('enrollmentDate')}>
                  <div className="flex items-center gap-1">
                    Enrollment
                    {sortBy === 'enrollmentDate' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 text-yellow-400" /> : <ChevronDown className="h-3 w-3 text-yellow-400" />)}
                  </div>
                </th>
                <th className="py-4 px-4 font-semibold">Status</th>
                <th className="py-4 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
              {isLoading ? (
                // Shimmer Skeleton Loader rows
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-4 bg-zinc-800 rounded w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-36"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-28"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-10"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-zinc-800 rounded w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-zinc-800 rounded-full w-16"></div></td>
                    <td className="py-4 px-5"><div className="h-4 bg-zinc-800 rounded ml-auto w-12"></div></td>
                  </tr>
                ))
              ) : students.length > 0 ? (
                students.map((student) => {
                  const dept = departments.find(d => d.id === student.deptId);
                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => onNavigate('student-profile', student.id)}
                      className="hover:bg-zinc-800/35 transition-all cursor-pointer group"
                    >
                      {/* ID with monospace styling */}
                      <td className="py-3.5 px-5 font-mono text-zinc-100 font-semibold tracking-tight">
                        {student.studentId}
                      </td>
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4 font-medium text-white group-hover:text-yellow-400 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {student.profilePhoto ? (
                              <img src={student.profilePhoto} referrerPolicy="no-referrer" alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-zinc-400">
                                {student.firstName[0]}{student.lastName[0]}
                              </span>
                            )}
                          </div>
                          <span className="truncate">{student.firstName} {student.lastName}</span>
                        </div>
                      </td>
                      {/* Department code */}
                      <td className="py-3.5 px-4 text-zinc-400 truncate max-w-[200px]" title={dept?.name}>
                        {dept?.name || 'Unassigned'}
                      </td>
                      {/* Year */}
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">
                        {student.currentYear} Yr
                      </td>
                      {/* Enrollment Date */}
                      <td className="py-3.5 px-4 text-zinc-400 font-mono">
                        {student.enrollmentDate}
                      </td>
                      {/* Status badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      {/* Action details trigger */}
                      <td className="py-3.5 px-5 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); onNavigate('student-profile', student.id); }}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all"
                            title="View Profile dossier"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {user?.role === 'Admin' && (
                            <button
                              onClick={(e) => handleDeleteStudent(e, student.id, `${student.firstName} ${student.lastName}`)}
                              className="p-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900 rounded-lg transition-all"
                              title="Archive dossier"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Empty State Design
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <GraduationCap className="h-12 w-12 text-zinc-700 mb-3" />
                      <h4 className="text-sm font-semibold text-zinc-200">No Student Records Found</h4>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                        No active dossiers match your current filters. Clear the search bar or register a new enrollment.
                      </p>
                      {user?.role !== 'Viewer' && (
                        <button
                          onClick={() => onNavigate('student-create')}
                          className="bg-yellow-400 text-zinc-950 font-bold text-[11px] py-1.5 px-3 rounded-lg mt-4"
                        >
                          Add Your First Student
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Panel */}
        {totalStudents > 0 && (
          <div className="border-t border-zinc-900/80 bg-zinc-950/20 py-4 px-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-zinc-500">
                Showing <span className="font-semibold text-zinc-300">{Math.min((page - 1) * limit + 1, totalStudents)}</span> to{' '}
                <span className="font-semibold text-zinc-300">{Math.min(page * limit, totalStudents)}</span> of{' '}
                <span className="font-semibold text-zinc-300">{totalStudents}</span> students
              </span>

              {/* Page size limit */}
              <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                <span>Page limit:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-1 py-0.5 outline-none focus:border-yellow-400 text-[10px]"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || isLoading}
                className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg disabled:opacity-40 disabled:hover:text-zinc-400 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  // Only display near pages for compact design
                  if (totalPages > 5 && Math.abs(pNum - page) > 1 && pNum !== 1 && pNum !== totalPages) {
                    if (pNum === 2 || pNum === totalPages - 1) {
                      return <span key={pNum} className="text-[10px] text-zinc-600 px-1 font-mono">..</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      disabled={isLoading}
                      className={`text-[11px] px-2.5 py-1 font-mono font-bold rounded-lg transition-all ${
                        page === pNum
                          ? 'bg-yellow-400 text-zinc-950 font-extrabold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || isLoading}
                className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg disabled:opacity-40 disabled:hover:text-zinc-400 transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
