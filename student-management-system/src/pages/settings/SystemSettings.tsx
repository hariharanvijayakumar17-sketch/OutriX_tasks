import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../store/AuthContext';
import { User, ActivityLog, Backup } from '../../types';
import { 
  Settings, 
  Users, 
  Database, 
  History, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Download, 
  RefreshCw, 
  Save, 
  CheckCircle,
  Clock,
  Loader2,
  Terminal,
  RotateCcw,
  X
} from 'lucide-react';

export default function SystemSettings() {
  const { user, settings, refreshSettings, showToast } = useAuth();
  
  // Tab Management
  const [activeTab, setActiveTab] = useState<'institutional' | 'users' | 'backups' | 'logs'>('institutional');

  // Institutional Pref States
  const [schoolName, setSchoolName] = useState(settings['school_name'] || '');
  const [academicYear, setAcademicYear] = useState(settings['academic_year'] || '2026-2027');
  const [gradingSystem, setGradingSystem] = useState(settings['grading_system'] || 'CGPA (10-Point Scale)');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // User Accounts CRUD States
  const [accounts, setAccounts] = useState<User[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Staff' | 'Viewer'>('Staff');

  // Backup States
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // Audit Logs States
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Load Settings and dependent records
  useEffect(() => {
    setSchoolName(settings['school_name'] || 'SMS Institute of Technology');
    setAcademicYear(settings['academic_year'] || '2026-2027');
    setGradingSystem(settings['grading_system'] || 'CGPA (10-Point Scale)');
  }, [settings]);

  // Load User Accounts
  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const data = await api.get<User[]>('/api/system/users');
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load system user accounts', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // Load Backups
  const fetchBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const data = await api.get<Backup[]>('/api/system/backups');
      setBackups(data);
    } catch (err) {
      console.error('Failed to parse database backups list', err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  // Load Audit Logs
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await api.get<ActivityLog[]>('/api/system/logs');
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit trail', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && user?.role === 'Admin') fetchAccounts();
    if (activeTab === 'backups' && user?.role === 'Admin') fetchBackups();
    if (activeTab === 'logs' && user?.role === 'Admin') fetchLogs();
  }, [activeTab, user]);

  // Save Institutional settings preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    try {
      await api.put('/api/system/settings', {
        school_name: schoolName,
        academic_year: academicYear,
        grading_system: gradingSystem,
      });
      await refreshSettings();
      showToast('Institutional preferences synced to disk.', 'success');
    } catch (err) {
      showToast('Failed to commit preferences.', 'error');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Add User handler
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserFullName || !newUserUsername || !newUserEmail || !newUserPassword) {
      showToast('Please provide all details for the user account.', 'warning');
      return;
    }

    try {
      await api.post('/api/system/users', {
        fullName: newUserFullName,
        username: newUserUsername,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      showToast(`User account created for ${newUserFullName}!`, 'success');
      setShowAddUserModal(false);
      // Reset
      setNewUserFullName('');
      setNewUserUsername('');
      setNewUserEmail('');
      setNewUserPassword('');
      fetchAccounts();
    } catch (err: any) {
      showToast(err.message || 'Failed to register account.', 'error');
    }
  };

  // Toggle user status active/inactive
  const handleToggleUserStatus = async (targetUser: User) => {
    try {
      await api.put(`/api/system/users/${targetUser.id}`, {
        fullName: targetUser.fullName,
        isActive: !targetUser.isActive,
      });
      showToast(`Status toggled for ${targetUser.fullName}.`, 'success');
      fetchAccounts();
    } catch (err) {
      showToast('Failed to modify user status.', 'error');
    }
  };

  // Trigger snapshot backup creation
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await api.post('/api/system/backup', {});
      showToast('System snapshot database backup successfully created.', 'success');
      fetchBackups();
    } catch (err: any) {
      showToast(err.message || 'Backup failed.', 'error');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Restore snapshot backup database
  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`CRITICAL WARNING: Restoring backup "${filename}" will completely overwrite the active SQLite ledger database. Are you absolutely certain you want to proceed?`)) {
      return;
    }

    try {
      showToast('Initiating database override restore sequence...', 'info');
      await api.post('/api/system/restore', { filename });
      showToast('Database restore complete! Refreshing ledger session.', 'success');
      // Briefly reload to sync database state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      showToast(err.message || 'Database restore override failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          System Administration
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Adjust institutional preferences, administrate user access accounts, trigger SQLite database backups, and inspect security audit trails.
        </p>
      </div>

      {/* Tab Nav Menu */}
      <div className="flex border-b border-zinc-800/80 gap-1 font-mono text-xs select-none">
        <button
          onClick={() => setActiveTab('institutional')}
          className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'institutional'
              ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
              : 'border-transparent text-zinc-500 hover:text-zinc-200'
          }`}
        >
          <Settings className="h-3.5 w-3.5" /> Institutional Configuration
        </button>

        {user?.role === 'Admin' ? (
          <>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'users'
                  ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" /> User Accounts CRUD
            </button>

            <button
              onClick={() => setActiveTab('backups')}
              className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'backups'
                  ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Database className="h-3.5 w-3.5" /> Backup & Restore
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'logs'
                  ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" /> Security Audit Log
            </button>
          </>
        ) : (
          <div className="py-3 px-4 text-zinc-600 flex items-center gap-1.5 select-none font-semibold">
            <ShieldAlert className="h-3.5 w-3.5" /> Admin Only Options Locked
          </div>
        )}
      </div>

      {/* Settings Tab Panels */}
      <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm">
        
        {/* Tab 1: Institutional preferences */}
        {activeTab === 'institutional' && (
          <form onSubmit={handleSavePreferences} className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800/60 pb-3">
              <Settings className="h-4 w-4 text-yellow-400" /> Institution Demographics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">School/Campus Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  disabled={user?.role === 'Viewer'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:border-yellow-400 outline-none disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">Active Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  disabled={user?.role === 'Viewer'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:border-yellow-400 outline-none disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">System Grading Convention</label>
                <input
                  type="text"
                  value={gradingSystem}
                  onChange={(e) => setGradingSystem(e.target.value)}
                  disabled={user?.role === 'Viewer'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:border-yellow-400 outline-none disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {user?.role !== 'Viewer' && (
              <div className="flex justify-end pt-4 border-t border-zinc-850">
                <button
                  type="submit"
                  disabled={isSavingPrefs}
                  className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
                >
                  {isSavingPrefs ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Apply Preferences
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: User Accounts CRUD management (Admin only) */}
        {activeTab === 'users' && user?.role === 'Admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Users className="h-4 w-4 text-yellow-400" /> Authorized Operator Accounts
              </h3>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> Create Operator
              </button>
            </div>

            {/* User Form Add Overlay Card */}
            {showAddUserModal && (
              <form onSubmit={handleAddUserSubmit} className="bg-zinc-950/70 p-5 rounded-2xl border border-zinc-850 space-y-4 max-w-xl">
                <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                  <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Enroll New Portal Operator</h4>
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newUserFullName}
                      onChange={(e) => setNewUserFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Username/ID</label>
                    <input
                      type="text"
                      value={newUserUsername}
                      onChange={(e) => setNewUserUsername(e.target.value)}
                      placeholder="janedoe"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="jane@sms.edu"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Password</label>
                    <input
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:border-yellow-400 outline-none"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Operator System Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:border-yellow-400 outline-none"
                    >
                      <option value="Admin">Admin (Full Control)</option>
                      <option value="Staff">Staff Registrar (Read, Edit, Uploads)</option>
                      <option value="Viewer">Auditor (Read-Only)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="bg-zinc-900 hover:bg-zinc-850 text-zinc-400 px-3 py-1.5 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                  >
                    Enroll Operator
                  </button>
                </div>
              </form>
            )}

            {/* Operator accounts table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-[10px] uppercase font-mono text-zinc-400">
                  <tr>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Toggle status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-950">
                  {isLoadingAccounts ? (
                    <tr><td colSpan={6} className="p-4 text-center">Loading operators list...</td></tr>
                  ) : accounts.length > 0 ? (
                    accounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-zinc-800/10">
                        <td className="p-3 font-semibold text-white">{acc.fullName}</td>
                        <td className="p-3 font-mono">{acc.username}</td>
                        <td className="p-3">{acc.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            acc.role === 'Admin' ? 'bg-red-500/10 text-red-400' :
                            acc.role === 'Staff' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-green-500/10 text-green-400'
                          }`}>
                            {acc.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`h-2.5 w-2.5 rounded-full inline-block ${acc.isActive ? 'bg-green-500' : 'bg-zinc-600'}`}></span>
                        </td>
                        <td className="p-3 text-right">
                          {acc.email !== 'admin@sms.edu' && acc.id !== user?.id ? (
                            <button
                              onClick={() => handleToggleUserStatus(acc)}
                              className="text-[10px] hover:underline text-yellow-400 cursor-pointer"
                            >
                              {acc.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-600">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="p-4 text-center">No operator accounts found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Backups (Admin only) */}
        {activeTab === 'backups' && user?.role === 'Admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Database className="h-4 w-4 text-yellow-400" /> Database Backup & Recovery Snapshots
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Implements SQL data portability. Overwrite active database with verified snapshots on-demand.</p>
              </div>

              <button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {isCreatingBackup ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Create Snapshot
              </button>
            </div>

            {/* List existing backups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingBackups ? (
                <div className="col-span-2 text-center text-xs py-6">Loading snapshot registries...</div>
              ) : backups.length > 0 ? (
                backups.map((bak, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 flex items-center justify-between group hover:border-zinc-700 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-850 text-yellow-400">
                        <Database className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200 truncate max-w-xs" title={bak.filename}>{bak.filename}</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                          {(bak.size / 1024).toFixed(1)} KB | {new Date(bak.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreBackup(bak.filename)}
                      className="p-1.5 bg-zinc-900 hover:bg-yellow-400/10 text-yellow-400 border border-zinc-800 hover:border-yellow-400/30 rounded-lg transition-all flex items-center gap-1 text-[10px] font-mono font-bold cursor-pointer"
                      title="Restore override snapshot"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> OVERRIDE DB
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-zinc-500 text-xs flex flex-col items-center justify-center">
                  No snapshot backups have been generated on disk yet. Click Create Snapshot to write one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Comprehensive Audit Trail logs (Admin only) */}
        {activeTab === 'logs' && user?.role === 'Admin' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-yellow-400" /> Administrative Security Audit Trail
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Immutable tracking of operator logins, student record alterations, and DB overrides.</p>
              </div>

              <button
                onClick={fetchLogs}
                className="p-2 bg-zinc-900 border border-zinc-800 hover:border-yellow-400/20 text-yellow-400 rounded-xl cursor-pointer"
                title="Refresh terminal logs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {isLoadingLogs ? (
                <div className="text-center text-xs py-6">Reading central audit ledger...</div>
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  let parsedChanges: any = {};
                  try {
                    parsedChanges = JSON.parse(log.changes);
                  } catch (e) {}

                  return (
                    <div key={log.id} className="p-3.5 bg-zinc-950/40 border border-zinc-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[10px]">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                            log.action === 'CREATE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            log.action === 'DELETE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            log.action === 'LOGIN' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' :
                            'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-zinc-200 font-bold">{log.userName}</span>
                          <span className="text-zinc-500">at {log.ipAddress}</span>
                          <span className="text-zinc-600">| Modified: {log.entity}</span>
                        </div>
                        {Object.keys(parsedChanges).length > 0 && (
                          <div className="text-zinc-400 text-[9px] max-w-3xl leading-relaxed whitespace-pre-wrap bg-zinc-950/60 p-1.5 rounded border border-zinc-900 mt-1">
                            {JSON.stringify(parsedChanges, null, 2)}
                          </div>
                        )}
                      </div>
                      <div className="text-zinc-500 text-right text-[9px] shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-zinc-500 text-xs py-8">No security logs recorded.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
