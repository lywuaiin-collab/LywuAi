import React from 'react';
import type { User, Subscription, TrialStatus } from '@lywuai/shared';
import { Plus, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { SubscriptionBadge } from './SubscriptionBadge';

interface NavbarProps {
  user: User | null;
  subscription?: Subscription | null;
  trial?: TrialStatus | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onUpgrade?: () => void;
  onNewSite: () => void;
  onGoHome: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, subscription: _subscription, trial: _trial, onOpenAuth, onLogout, onUpgrade: _onUpgrade, onNewSite, onGoHome, onOpenGuide }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={onGoHome}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            L
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                Lywu<span className="text-blue-600">Ai</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                $1/month only
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 tracking-tight mt-0.5">
              Launch Your Website Using AI
            </span>
          </div>
        </div>

        <nav className="flex items-center space-x-2.5">
          <a
            href="https://connect.lywuai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition shadow-2xs"
            title="Open LiwuAI Connect - AI Social Media Workspace"
          >
            <Sparkles size={13} className="text-indigo-600" />
            <span>Social Connect ↗</span>
          </a>

          <button
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
          >
            <span>📖 Guide</span>
          </button>

          {user ? (
            <>
              {/* Free Forever Badge */}
              <SubscriptionBadge />

              <button
                onClick={onNewSite}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-500/20 transition"
              >
                <Plus size={15} />
                <span>Create Website</span>
              </button>

              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <UserIcon size={14} className="text-slate-500" />
                  <span>{user.name || user.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
