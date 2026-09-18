import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!role) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const basePath = role === 'admin' ? '/admin-dashboard' : '/student-dashboard';

  const navLinks = role === 'student'
    ? [
        { path: `${basePath}/rooms`, label: 'Available Rooms', icon: '🏢' },
        { path: `${basePath}/preferences`, label: 'Room Preferences', icon: '⭐' },
        { path: `${basePath}/my-allotment`, label: 'My Allotment', icon: '📋' },
      ]
    : [
        { path: `${basePath}/rooms`, label: 'Manage Rooms', icon: '🏢' },
        { path: `${basePath}/add-room`, label: 'Add Room', icon: '➕' },
        { path: `${basePath}/results`, label: 'Allotment Results', icon: '📊' },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link to={basePath + '/rooms'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#004d40] text-emerald-200 flex items-center justify-center shadow-xs group-hover:bg-[#00382e] transition">
                <svg className="w-6 h-6 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl block leading-tight">
                  NIT Agartala
                </span>
                <span className="text-xs font-semibold text-[#00695c] block tracking-wide">
                  Hostel Allotment Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#e8f5e9] text-[#004d40] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Role Badge & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full ${role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="capitalize">{role}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition"
              title="Sign out of your session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
            <div className="px-3 py-2 mb-2 flex items-center justify-between text-sm text-slate-600 bg-slate-50 rounded-lg font-medium">
              <span>Logged in as:</span>
              <span className="font-bold text-slate-900 capitalize">{role}</span>
            </div>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-medium ${
                    isActive
                      ? 'bg-[#e8f5e9] text-[#004d40] font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;