import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [roomsCount, setRoomsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [allottedCount, setAllottedCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [roomsRes, studentsRes] = await Promise.all([
          fetch(`${API}/api/rooms`),
          fetch(`${API}/api/allotments/admin-students`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (roomsRes.ok) {
          const rData = await roomsRes.json();
          setRoomsCount((rData.rooms || []).length);
        }

        if (studentsRes.ok) {
          const sData = await studentsRes.json();
          const sList = sData.students || [];
          setStudentsCount(sList.length);
          setAllottedCount(sList.filter((s) => s.allotted_room_number).length);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCounts();
  }, [API, token, location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navTabs = [
    {
      path: '/admin-dashboard/overview',
      label: 'Overview',
      icon: '📊',
    },
    {
      path: '/admin-dashboard/rooms',
      label: 'Rooms',
      icon: '🏢',
      count: roomsCount,
    },
    {
      path: '/admin-dashboard/add-room',
      label: 'Add Room',
      icon: '➕',
    },
    {
      path: '/admin-dashboard/students',
      label: 'Students',
      icon: '👥',
      count: studentsCount,
    },
    {
      path: '/admin-dashboard/results',
      label: 'Allotment',
      icon: '⚡',
      count: allottedCount > 0 ? allottedCount : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <div>
        {/* Top Header Navbar */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Brand Logo & Name */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#004d40] text-emerald-200 flex items-center justify-center shadow-xs">
                  <svg className="w-6 h-6 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-slate-900 tracking-tight text-xl sm:text-2xl leading-tight">
                      NIT Agartala
                    </span>
                    <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Admin console
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#00695c] block tracking-wide">
                    Hostel &amp; Estate Management · R.N. Tagore Hostel
                  </span>
                </div>
              </div>

              {/* Right Side: Admin identity & Sign Out */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-base font-bold text-slate-800 leading-tight">Chief Warden Office</p>
                  <p className="text-xs font-semibold text-slate-400">NIT Agartala Campus</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center text-base font-bold shadow-xs">
                  CW
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-semibold border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 px-4 py-2 rounded-xl transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs (Sub-routes with active URL indicator) */}
          <div className="flex bg-slate-200/70 p-1.5 rounded-2xl mb-8 w-fit gap-1 text-base font-bold">
            {navTabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        isActive ? 'bg-slate-100 text-slate-700' : 'bg-slate-300/60 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Child Page Renders Here via Outlet */}
          <Outlet />
        </main>
      </div>

      {/* University Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-4 text-center text-sm text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="m-0 font-medium">
            © 2026–27 <strong>National Institute of Technology Agartala</strong> · Chief Warden Office
          </p>
          <p className="m-0 text-slate-500 font-medium">
            Authorized administrative console · Gale-Shapley Matching Engine v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;