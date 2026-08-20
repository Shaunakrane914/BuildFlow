import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HardHat, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { RoleBadge } from '../components/common/Badge';

export const LoginPage: React.FC = () => {
  const { demoUsers, loginAs } = useAuth();
  const navigate = useNavigate();

  const handleSelectUser = async (user: any) => {
    await loginAs(user);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center relative z-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 font-display font-extrabold text-3xl mb-4">
          <HardHat className="w-10 h-10 text-slate-950 fill-current" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
          BUILD<span className="text-amber-400">Flow</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          Construction Project Management & Multi-Stakeholder Collaboration Platform
        </p>

        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Software Engineering Academic Demonstration</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-base font-bold text-white flex items-center justify-between">
              <span>Select a Demo Stakeholder Persona to Enter:</span>
              <span className="text-xs font-mono text-amber-400 font-normal">8 Roles Seeded</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any stakeholder to experience role-based construction workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 group-hover:ring-amber-500/50 transition-all"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">{user.title}</p>
                    <div className="mt-1">
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
            <span>Recommended for Live Presentation: </span>
            <span className="text-amber-400 font-semibold">Alex Vance (Project Manager)</span> or{' '}
            <span className="text-sky-400 font-semibold">Marcus Brody (Engineer)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
