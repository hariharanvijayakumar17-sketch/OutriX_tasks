import React from 'react';
import { 
  Info, 
  ShieldCheck, 
  Database, 
  Terminal, 
  Layers, 
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner Board */}
      <div className="bg-[#121212] p-8 rounded-xl border border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none"></div>
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-semibold mb-4 border border-yellow-500/20 font-mono">
            System Spec v1.0.0 Stable
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">
            SMS Enterprise <span className="text-yellow-400 font-normal">Security Architecture</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            The Student Management System (SMS) Enterprise is a robust administrative ledger platform designed to preserve verified student directories, support role-based permission matrices, and provide absolute data persistence portability.
          </p>
        </div>
      </div>

      {/* Grid Specifications cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Spec 1: Architecture Tech Stack */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="h-4 w-4 text-yellow-400" /> Platform Architecture Spec
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Engineered with a full-stack, high-performance architecture separating high-speed presentation rendering from durable server-side ledger databases:
          </p>

          <div className="space-y-3 pt-2 font-mono text-[11px] text-zinc-400">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-850">
              <span className="text-zinc-300 font-semibold">Presentation Tier</span>
              <span className="text-yellow-400">React 19, Tailwind CSS v4, Vite</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-850">
              <span className="text-zinc-300 font-semibold">Service API Tier</span>
              <span className="text-yellow-400">Node.js Express Full-Stack Server</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-850">
              <span className="text-zinc-300 font-semibold">Durable Database Engine</span>
              <span className="text-yellow-400">JSON/SQLite Portable Data Store</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-850">
              <span className="text-zinc-300 font-semibold">Session Encryption</span>
              <span className="text-yellow-400">HMAC-SHA256 Token Signature</span>
            </div>
          </div>
        </div>

        {/* Spec 2: RBAC Matrix */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-yellow-400" /> Security Access Permissions Matrix
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The system employs strict client + server-enforced role-based access control (RBAC). Permissions are verified cryptographically upon every network transaction:
          </p>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex gap-3 items-start">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 mt-0.5 font-mono">ADMIN</span>
              <div>
                <p className="font-semibold text-zinc-200">Administrator Console</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Absolute permissions. Perform student CRUD, edit institutional layouts, administrate operator credentials, and execute SQL restores/backups.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5 font-mono">STAFF</span>
              <div>
                <p className="font-semibold text-zinc-200">Registrar Staff Operator</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Write and edit permissions. Enroll students, modify demographic records, upload transcript attachments, and export CSVs.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 mt-0.5 font-mono">VIEWER</span>
              <div>
                <p className="font-semibold text-zinc-200">Auditor (Read-Only)</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Inspection permissions. Perform multi-criteria directory lookups, view portfolios, inspect analytics distributions. All writing is strictly locked.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spec 3: Data Portability Schema details */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Database className="h-4 w-4 text-yellow-400" /> Portable Relational Schema
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Durable persistence is achieved using a robust, thread-safe JSON relational emulation reflecting SQLite constraints. Includes structural triggers executing instant administrative logging:
          </p>

          <div className="space-y-2 pt-1.5 text-xs text-zinc-400 leading-relaxed list-decimal pl-4">
            <div>
              <span className="text-zinc-200 font-semibold font-mono">Index Optimization:</span> High-speed unique index maps Student IDs to prevent duplication on multiple entries.
            </div>
            <div>
              <span className="text-zinc-200 font-semibold font-mono">Foreign Keys:</span> Department mapping links student enrollment records directly to Department faculties.
            </div>
            <div>
              <span className="text-zinc-200 font-semibold font-mono">Immutable Snapshots:</span> Clicking "Backup" in System settings writes an instant snapshot timestamp to the `/backups/` directory.
            </div>
          </div>
        </div>

        {/* Spec 4: Design Accents details */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" /> Crafted Design Aesthetics
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Styled with meticulous attention to modern workspace interfaces, prioritizing legibility and negative space:
          </p>

          <div className="space-y-2 pt-1.5 text-xs text-zinc-400 leading-relaxed list-disc pl-4">
            <div>
              <span className="text-zinc-200 font-semibold">Slate Twilight Motif:</span> Pure deep zinc surfaces contrasting with vibrant amber-gold primary highlights.
            </div>
            <div>
              <span className="text-zinc-200 font-semibold">Interactive Micro-motions:</span> Seamless staggered hover animations and transitions.
            </div>
            <div>
              <span className="text-zinc-200 font-semibold">Touch Optimization:</span> Click targets are responsive and accessible on both desktop and mobile platforms.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
