import React from 'react';
import { useRole } from '@/store/RoleContext';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { user, isAuthenticated, logout } = useRole();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center font-sans-ui">
        <div className="bg-white p-12 rounded-2xl border border-border-archival shadow-lg space-y-4">
          <div className="w-16 h-16 bg-[#063b36]/10 text-archival-teal rounded-2xl flex items-center justify-center mx-auto border border-archival-teal/20">
            <span className="material-symbols-outlined text-[36px]">badge</span>
          </div>
          <h2 className="font-serif-display text-3xl font-bold text-archival-teal">
            Patron Credentials Required
          </h2>
          <p className="font-serif-body text-sm text-ink-muted italic max-w-md mx-auto">
            Sign in to access your scholar registry card, library clearance certificates, and circulation history.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-lg bg-archival-teal hover:bg-archival-deep text-white font-sans-ui text-xs font-semibold shadow-sm transition-all"
          >
            Authenticate Patron Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 md:px-12 py-10 max-w-5xl mx-auto space-y-8 font-sans-ui">
      <div className="border-b border-border-archival pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gilded-amber mb-1">
          <span className="material-symbols-outlined text-[15px]">badge</span>
          Academic Credential Registry
        </div>
        <h1 className="font-serif-display text-3xl font-bold text-archival-teal">
          Scholar Patron Dossier
        </h1>
        <p className="font-serif-body text-xs italic text-ink-muted mt-1">
          Registered institutional credentials, borrowing clearance tier, and circulation privileges.
        </p>
      </div>

      <div className="bg-white border border-border-archival rounded-2xl shadow-xs overflow-hidden">
        {/* Top Dossier Header */}
        <div className="p-8 bg-parchment-subtle border-b border-border-archival flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-archival-teal text-white flex items-center justify-center font-serif-display font-bold text-2xl shadow-sm border-2 border-white">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="font-serif-display text-2xl font-bold text-archival-teal">
                {user?.name}
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold uppercase tracking-wider border border-[#a7f3d0]">
                Active Fellow
              </span>
            </div>
            <p className="font-mono text-xs text-ink-muted">{user?.email}</p>
            <p className="font-serif-body text-xs italic text-ink-muted pt-1">
              Athenaeum Research Scholar • Comparative Humanities Department
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-parchment-bg rounded-xl border border-border-archival">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
              Patron Card Identifier
            </span>
            <p className="font-mono text-base font-bold text-archival-teal">
              #ATH-88421
            </p>
          </div>

          <div className="p-5 bg-parchment-bg rounded-xl border border-border-archival">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
              Circulation Access Tier
            </span>
            <p className="font-serif-display text-base font-bold text-archival-teal">
              Tier III • Unrestricted Stacks &amp; Vault Reserves
            </p>
          </div>

          <div className="p-5 bg-parchment-bg rounded-xl border border-border-archival">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
              Institutional Registration
            </span>
            <p className="font-serif-display text-base font-bold text-ink-primary">
              Chartered March 2024
            </p>
          </div>

          <div className="p-5 bg-parchment-bg rounded-xl border border-border-archival">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
              Account Delinquency Status
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#059669] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              Clearance Verified • Zero Restrictions
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#f8fafc] border-t border-border-archival flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/user/borrowed')}
            className="text-xs font-semibold text-archival-teal hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Return to Circulation Desk
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
