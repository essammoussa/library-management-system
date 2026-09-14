import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '@/store/RoleContext';

interface AthenaeumHeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  className?: string;
}

export const AthenaeumHeader: React.FC<AthenaeumHeaderProps> = ({ 
  onSearch, 
  showSearch = true,
  className = ''
}) => {
  const { role, user, isAuthenticated, logout } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-[#fcfbf7]/95 backdrop-blur-md border-b border-border-archival shadow-[0_1px_12px_rgba(40,30,15,0.05)] transition-all ${className}`}>
      <div className="h-20 w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-3 md:gap-4 xl:gap-6 max-w-[1600px] mx-auto">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 md:gap-4 lg:gap-5 xl:gap-7 min-w-0 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0">
            <div className="w-10 h-10 shrink-0 shadow-sm rounded-lg overflow-hidden border border-archival-teal/20 group-hover:scale-105 transition-transform bg-[#063b36] flex items-center justify-center">
              <svg fill="none" height="40" viewBox="0 0 48 48" width="40" xmlns="http://www.w3.org/2000/svg">
                <rect fill="#063b36" height="48" rx="8" width="48" />
                <path d="M12 34V15.5C12 14.12 13.12 13 14.5 13H22C23.1 13 24 13.9 24 15V33C24 33.55 23.55 34 23 34H12Z" fill="#ffffff" fillOpacity="0.95" />
                <path d="M36 34V15.5C36 14.12 34.88 13 33.5 13H26C24.9 13 24 13.9 24 15V33C24 33.55 24.45 34 25 34H36Z" fill="#ffffff" fillOpacity="0.8" />
                <path d="M24 14V34" stroke="#042824" strokeLinecap="round" strokeWidth="2" />
                <circle cx="24" cy="11" fill="#d97706" r="2.5" />
                <line stroke="#063b36" strokeLinecap="round" strokeWidth="1.5" x1="15" x2="21" y1="18" y2="18" />
                <line stroke="#063b36" strokeLinecap="round" strokeWidth="1.5" x1="15" x2="21" y1="22" y2="22" />
                <line stroke="#063b36" strokeLinecap="round" strokeWidth="1.5" x1="15" x2="19" y1="26" y2="26" />
                <line stroke="#063b36" strokeLinecap="round" strokeWidth="1.5" x1="27" x2="33" y1="18" y2="18" />
                <line stroke="#063b36" strokeLinecap="round" strokeWidth="1.5" x1="27" x2="33" y1="22" y2="22" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif-display text-lg sm:text-xl font-bold tracking-tight text-archival-teal leading-none whitespace-nowrap shrink-0">
                  Athenaeum Library
                </span>
                <span className="text-[9px] font-sans-ui uppercase tracking-widest px-1.5 py-0.5 rounded bg-gilded-light text-gilded-amber font-bold border border-gilded-amber/20 hidden md:inline-block shrink-0">
                  Est. 1884
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-serif-body italic text-ink-muted mt-0.5 truncate max-w-[160px] 2xl:max-w-[240px] hidden xl:inline-block">
                Editorial Archival &amp; Heritage Repositories
              </span>
            </div>
          </Link>

          <div className="h-6 w-px bg-border-archival hidden lg:block shrink-0" />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink min-w-0">
            <Link 
              to="/" 
              className={`px-2.5 xl:px-3.5 py-2 font-sans-ui text-xs xl:text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                isActive('/') && location.pathname === '/' 
                  ? 'bg-archival-teal text-white' 
                  : 'text-archival-teal hover:bg-parchment-subtle'
              }`}
            >
              <span className={`material-symbols-outlined text-[17px] shrink-0 ${isActive('/') && location.pathname === '/' ? 'text-white' : 'text-gilded-amber'}`}>
                auto_stories
              </span> 
              <span className="hidden xl:inline">Rare Manuscripts &amp; Stacks</span>
              <span className="xl:hidden">Manuscripts</span>
            </Link>


            <Link 
              to="/user/borrowed" 
              className={`px-2.5 xl:px-3.5 py-2 font-sans-ui text-xs xl:text-sm font-medium rounded-md transition-colors shrink-0 whitespace-nowrap ${
                isActive('/user') 
                  ? 'bg-archival-teal text-white' 
                  : 'text-ink-muted hover:text-archival-teal hover:bg-parchment-subtle'
              }`}
            >
              Member Portal
            </Link>

            {(role === 'admin' || !isAuthenticated) && (
              <Link 
                to="/admin" 
                className={`px-2.5 xl:px-3.5 py-2 font-sans-ui text-xs xl:text-sm font-medium rounded-md transition-colors shrink-0 whitespace-nowrap ${
                  isActive('/admin') 
                    ? 'bg-archival-teal text-white' 
                    : 'text-ink-muted hover:text-archival-teal hover:bg-parchment-subtle'
                }`}
              >
                Librarian Desk
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:flex items-center w-28 sm:w-36 lg:w-32 xl:w-44 2xl:w-56 focus-within:w-44 sm:focus-within:w-48 lg:focus-within:w-44 xl:focus-within:w-56 transition-all duration-200 shrink-0">
              <span className="material-symbols-outlined absolute left-2.5 sm:left-3 text-ink-muted/70 text-[16px] sm:text-[18px]">
                search
              </span>
              <input 
                type="text"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                placeholder="Search archives..."
                className="w-full bg-parchment-subtle border border-border-archival text-ink-primary pl-8 sm:pl-9 pr-8 sm:pr-10 py-1.5 rounded-md font-sans-ui text-xs placeholder:text-ink-muted/70 focus:outline-none focus:ring-1 focus:ring-archival-teal focus:bg-white truncate"
              />
              <div className="absolute right-2 hidden sm:flex items-center px-1.5 py-0.5 rounded bg-border-archival/60 text-ink-muted text-[10px] font-mono">
                ⌘K
              </div>
            </form>
          )}

          {/* Reading Hall Status Badge (Rendered on wide screens where space permits) */}
          <div className="hidden 2xl:flex items-center gap-2 shrink-0">
            <div className="h-6 w-px bg-border-archival mr-1 shrink-0" />
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-parchment-subtle border border-border-archival whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-status-available animate-pulse shrink-0" />
              <span className="text-xs font-serif-body italic text-ink-muted">
                Main Reading Hall: <span className="font-sans-ui font-semibold text-archival-teal not-italic">Open</span>
              </span>
            </div>
          </div>

          {/* Notifications */}
          <button 
            type="button"
            aria-label="Reading Room Notifications"
            className="relative p-2 text-ink-muted hover:text-archival-teal hover:bg-parchment-subtle rounded-md transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gilded-amber" />
          </button>

          {/* Auth Button or User Profile */}
          {isAuthenticated ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg hover:bg-parchment-subtle transition-colors shrink-0"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-archival-teal text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                </div>
                <span className="hidden sm:inline font-sans-ui text-xs font-semibold text-archival-teal max-w-[80px] lg:max-w-[100px] truncate whitespace-nowrap">
                  {user?.name || 'Patron'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-ink-muted shrink-0">
                  expand_more
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-border-archival rounded-xl shadow-xl py-1.5 z-50 font-sans-ui">
                  <div className="px-3 py-2 border-b border-border-archival">
                    <p className="text-xs font-semibold text-ink-primary truncate">{user?.name}</p>
                    <p className="text-[11px] text-ink-muted truncate">{user?.email}</p>
                  </div>

                  {/* Role Switcher in dropdown */}
                  <div className="px-3 py-2 border-b border-border-archival bg-parchment-subtle/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                      Active Role
                    </span>
                    <div className="flex items-center bg-white border border-border-archival rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/user/borrowed');
                        }}
                        className={`flex-1 py-1 rounded text-xs font-semibold transition-all ${
                          isActive('/user') ? 'bg-archival-teal text-white' : 'text-ink-muted hover:text-ink-primary'
                        }`}
                      >
                        Member
                      </button>
                      {role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/admin');
                          }}
                          className={`flex-1 py-1 rounded text-xs font-semibold transition-all ${
                            isActive('/admin') ? 'bg-archival-teal text-white' : 'text-ink-muted hover:text-ink-primary'
                          }`}
                        >
                          Librarian
                        </button>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/user/borrowed"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-ink-muted hover:bg-parchment-subtle hover:text-archival-teal whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[16px] shrink-0">book</span>
                    <span className="truncate">My Circulation Loans</span>
                  </Link>
                  <Link
                    to="/user/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-ink-muted hover:bg-parchment-subtle hover:text-archival-teal whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[16px] shrink-0">badge</span>
                    <span className="truncate">Patron Profile</span>
                  </Link>
                  {role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-ink-muted hover:bg-parchment-subtle hover:text-archival-teal whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px] shrink-0">admin_panel_settings</span>
                      <span className="truncate">Librarian Console</span>
                    </Link>
                  )}
                  <div className="border-t border-border-archival mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px] shrink-0">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-archival-teal text-white hover:bg-archival-deep shadow-sm transition-all text-xs font-medium shrink-0 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px] text-gilded-gold shrink-0">local_library</span>
              <span className="hidden sm:inline">Patron Sign-In</span>
            </Link>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 text-ink-muted hover:text-archival-teal rounded-md lg:hidden transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-archival bg-[#fcfbf7] px-6 py-4 shadow-lg flex flex-col gap-3">
          <nav className="flex flex-col gap-1">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded text-archival-teal font-sans-ui text-sm font-semibold hover:bg-parchment-subtle"
            >
              Rare Manuscripts &amp; Stacks
            </Link>
            <Link 
              to="/user/borrowed" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded text-ink-muted font-sans-ui text-sm hover:bg-parchment-subtle"
            >
              Member Portal
            </Link>
            <Link 
              to="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded text-ink-muted font-sans-ui text-sm hover:bg-parchment-subtle"
            >
              Librarian Desk
            </Link>
          </nav>
          <div className="pt-2 border-t border-border-archival flex items-center gap-2">
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 rounded font-sans-ui text-xs font-semibold bg-archival-teal text-white text-center"
              >
                Patron Desk Access
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="flex-1 py-2 rounded font-sans-ui text-xs font-semibold bg-red-100 text-red-700 text-center"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
