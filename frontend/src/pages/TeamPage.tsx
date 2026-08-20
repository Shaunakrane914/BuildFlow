import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/Badge';
import { TraceBadge } from '../components/common/TraceBadge';
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { loginAs, currentUser } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    async function loadTeam() {
      setIsLoading(true);
      try {
        const data = await api.getTeamUsers();
        setTeamMembers(data);
      } catch (err) {
        console.error('Failed to load team members:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTeam();
  }, []);

  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Multi-Stakeholder Team Directory
            </h1>
            <TraceBadge reqId="FR-01" label="Stakeholder Collaboration" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Cross-functional construction team members across Owner, Engineering, General Contracting, and Inspections.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, title, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            'ALL',
            'PROJECT_MANAGER',
            'ENGINEER',
            'ARCHITECT',
            'CONTRACTOR',
            'SITE_SUPERVISOR',
            'SUPPLIER',
            'INSPECTOR',
          ].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {role === 'ALL' ? 'ALL' : role.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Team Cards Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No team members found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const isCurrent = member.id === currentUser?.id;
            return (
              <div
                key={member.id}
                className={`glass-panel rounded-2xl p-6 flex flex-col justify-between border transition-all ${
                  isCurrent ? 'border-amber-500/50 bg-amber-500/5 shadow-md shadow-amber-500/10' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white truncate">{member.name}</h3>
                        {isCurrent && (
                          <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-400">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{member.title}</p>
                      <div className="mt-1.5">
                        <RoleBadge role={member.role} />
                      </div>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{member.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate font-mono text-[11px]">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-mono text-[11px]">{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Workload Indicator */}
                  {member.workload && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Task Workload:</span>
                        <span className="font-mono font-bold text-white">
                          {member.workload.activeTasks} Active ({member.workload.status})
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            member.workload.workloadPercentage >= 80
                              ? 'bg-rose-400'
                              : member.workload.workloadPercentage >= 40
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${member.workload.workloadPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Switch Persona Button */}
                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => loginAs(member)}
                    disabled={isCurrent}
                    className={`w-full rounded-xl py-2 text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-slate-900 text-slate-500 cursor-default'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    {isCurrent ? 'Currently Logged In' : `Switch Persona to ${member.name.split(' ')[0]}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
