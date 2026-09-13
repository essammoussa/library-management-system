import React from 'react';
import { Link } from 'react-router-dom';

export const AthenaeumFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#042824] text-[#e8e0d0] border-t border-border-archival/30 py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          {/* Col 1: Brand & Charter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg fill="none" height="28" viewBox="0 0 48 48" width="28" xmlns="http://www.w3.org/2000/svg">
                <rect fill="#0c4a43" height="48" rx="8" width="48" />
                <path d="M12 34V15.5C12 14.12 13.12 13 14.5 13H22C23.1 13 24 13.9 24 15V33C24 33.55 23.55 34 23 34H12Z" fill="#ffffff" />
                <path d="M36 34V15.5C36 14.12 34.88 13 33.5 13H26C24.9 13 24 13.9 24 15V33C24 33.55 24.45 34 25 34H36Z" fill="#ffffff" fillOpacity="0.8" />
                <circle cx="24" cy="11" fill="#d97706" r="2.5" />
              </svg>
              <span className="font-serif-display text-lg font-bold text-[#fbf9f4]">Athenaeum Library</span>
            </div>
            <p className="font-serif-body text-xs italic text-[#c5bcad] leading-relaxed">
              Chartered for universal scholarly access, systematic folio conservation, and historical manuscript discovery.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-sans-ui text-gilded-gold">
              <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
              Climate Vault Systems Active • 19.5°C
            </div>
          </div>

          {/* Col 2: Hours */}
          <div className="space-y-2">
            <h4 className="font-sans-ui text-xs font-bold uppercase tracking-widest text-gilded-gold">
              Reading Room Hours
            </h4>
            <ul className="space-y-1 font-serif-body text-xs text-[#c5bcad] italic">
              <li>Mon – Thu: 08:00 – 22:00</li>
              <li>Friday: 08:00 – 20:00</li>
              <li>Saturday: 09:00 – 18:00</li>
              <li>Sunday: 11:00 – 21:00 (Study Hall)</li>
            </ul>
          </div>

          {/* Col 3: Archival Registry Stats */}
          <div className="space-y-2">
            <h4 className="font-sans-ui text-xs font-bold uppercase tracking-widest text-gilded-gold">
              Archival Registry
            </h4>
            <ul className="space-y-1 font-sans-ui text-xs text-[#c5bcad]">
              <li className="flex justify-between">
                <span>Preserved Folios</span>
                <span className="font-mono text-[#fbf9f4]">342,890</span>
              </li>
              <li className="flex justify-between">
                <span>Illuminated Scans</span>
                <span className="font-mono text-[#fbf9f4]">128,450</span>
              </li>
              <li className="flex justify-between">
                <span>Active Scholars</span>
                <span className="font-mono text-[#fbf9f4]">14,210</span>
              </li>
              <li className="flex justify-between">
                <span>Daily Dispatches</span>
                <span className="font-mono text-[#fbf9f4]">3,184</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional Links */}
          <div className="space-y-2">
            <h4 className="font-sans-ui text-xs font-bold uppercase tracking-widest text-gilded-gold">
              Institutional Links
            </h4>
            <ul className="space-y-1 font-sans-ui text-xs text-[#c5bcad]">
              <li>
                <Link to="/" className="hover:text-gilded-gold transition-colors">Rare Manuscripts &amp; Stacks</Link>
              </li>
              <li>
                <Link to="/user/borrowed" className="hover:text-gilded-gold transition-colors">Patron Circulation Desk</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-gilded-gold transition-colors">Librarian Operations Console</Link>
              </li>
              <li>
                <a href="#exhibitions-section" className="hover:text-gilded-gold transition-colors">Reading Exhibitions</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-sans-ui text-[#c5bcad] gap-4">
          <p>© 2025 Athenaeum Archival &amp; Heritage Repositories. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gilded-gold transition-colors">Conservation Policy</a>
            <a href="#" className="hover:text-gilded-gold transition-colors">Open Archival Charter</a>
            <a href="#" className="hover:text-gilded-gold transition-colors">Patron Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
