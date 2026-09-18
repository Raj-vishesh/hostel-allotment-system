import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [roomsCount, setRoomsCount] = useState(0);
  const [prefCount, setPrefCount] = useState(0);
  const [allotment, setAllotment] = useState(null);
  const [availableCount, setAvailableCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem('name') || 'Student';
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [roomsRes, prefRes, allotRes] = await Promise.all([
          fetch(`${API}/api/rooms`),
          fetch(`${API}/api/preferences/my`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/allotments/my`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (roomsRes.ok) {
          const rData = await roomsRes.json();
          const rList = rData.rooms || [];
          setRoomsCount(rList.length);
          setAvailableCount(rList.filter((r) => r.is_available).length);
        }

        if (prefRes.ok) {
          const pData = await prefRes.json();
          setPrefCount((pData.preferences || []).length);
        }

        if (allotRes.ok) {
          const aData = await allotRes.json();
          setAllotment(aData.allotment);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadOverview();
  }, [API, token, location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navTabs = [
    {
      path: '/student-dashboard/rooms',
      label: 'Browse Rooms',
      icon: '🏢',
      count: roomsCount,
    },
    {
      path: '/student-dashboard/preferences',
      label: 'My Preferences',
      icon: '⭐',
      count: prefCount,
    },
    {
      path: '/student-dashboard/my-allotment',
      label: 'My Allotment',
      icon: '📋',
      dot: Boolean(allotment),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <div>
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* College Branding */}
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
                    <span className="text-xs sm:text-sm uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      RNT Hostel
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Profile & Sign Out */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-base font-bold text-slate-800 leading-tight">{name}</p>
                  <p className="text-xs font-semibold text-slate-400">Student Portal</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#004d40]/10 border border-[#004d40]/20 text-[#004d40] flex items-center justify-center text-base font-bold shadow-xs">
                  {name.charAt(0).toUpperCase()}
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
          {/* Welcome Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Welcome, {name.split(' ')[0]}!
                </h1>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                  R.N. Tagore (RNT) Hostel features <strong>5 Residential Blocks (Block A to Block E)</strong> across <strong>5 Floors each</strong>.
                  Browse available rooms, rank your choices, and save your list. Allotment is decided by the <strong>Gale-Shapley stable matching algorithm</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`px-5 py-2.5 rounded-2xl text-sm sm:text-base font-bold flex items-center gap-2.5 border ${
                    allotment
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                      : 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${allotment ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>{allotment ? `Allotted: Room ${allotment.room_number}` : 'Allotment Pending'}</span>
                </div>
              </div>
            </div>

            {/* Quick stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-slate-700">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-bold">Hostel</p>
                <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">RNT Hostel</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-bold">Structure</p>
                <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">5 Blocks · 5 Floors</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-bold">Total Available</p>
                <p className="text-lg sm:text-xl font-black text-emerald-700 mt-1">{availableCount} Rooms</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-bold">Ranked by You</p>
                <p className="text-lg sm:text-xl font-black text-[#00695c] mt-1">{prefCount} Selected</p>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs (Links with active URL indicator) */}
          <div className="flex bg-slate-200/70 p-1.5 rounded-2xl mb-8 w-fit gap-1 text-base font-bold print:hidden">
            {navTabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all ${
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
                  {tab.dot && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                </Link>
              );
            })}
          </div>

          {/* Nested Child Component Renders Here via Outlet */}
          <Outlet />
        </main>
      </div>

      {/* University Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-4 text-center text-sm text-slate-600 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="m-0 font-medium">
            © 2026–27 <strong>National Institute of Technology Agartala</strong> · R.N. Tagore Hall of Residence
          </p>
          <p className="m-0 text-slate-500 font-medium">
            For assistance, contact Chief Warden Office at <a href="mailto:hostel@nita.ac.in" className="text-[#00695c] font-bold hover:underline">hostel@nita.ac.in</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default StudentDashboard;