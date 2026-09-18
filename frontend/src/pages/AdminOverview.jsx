import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminOverview() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, studentsRes] = await Promise.all([
          fetch(`${API}/api/rooms`),
          fetch(`${API}/api/allotments/admin-students`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (roomsRes.ok) {
          const rData = await roomsRes.json();
          setRooms(rData.rooms || []);
        }

        if (studentsRes.ok) {
          const sData = await studentsRes.json();
          setStudents(sData.students || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API, token]);

  const totalRoomsCount = rooms.length;
  const totalBedsCount = rooms.reduce((acc, r) => acc + (Number(r.capacity) || 1), 0);
  const registeredStudentsCount = students.length;
  const allottedStudentsCount = students.filter((s) => s.allotted_room_number).length;
  const pendingStudentsCount = registeredStudentsCount - allottedStudentsCount;
  const occupancyPct = totalBedsCount > 0 ? Math.round((allottedStudentsCount / totalBedsCount) * 100) : 0;

  const rntBlocks = ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'];
  const blockStats = rntBlocks.map((blockName) => {
    const blockRooms = rooms.filter((r) => r.hostel_block === blockName);
    const capacityInBlock = blockRooms.reduce((acc, r) => acc + (Number(r.capacity) || 1), 0);
    const allottedInBlock = students.filter((s) => s.allotted_block === blockName).length;
    const pct = capacityInBlock > 0 ? Math.round((allottedInBlock / capacityInBlock) * 100) : 0;
    return {
      name: blockName,
      allotted: allottedInBlock,
      capacity: capacityInBlock,
      pct,
    };
  });

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-base font-medium">Loading operations metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hostel Operations Overview
        </h1>
        <p className="text-base sm:text-lg text-slate-600 mt-1">
          NIT Agartala · R.N. Tagore (RNT) Hostel · 5 Blocks (Block A to Block E) · 5 Floors Each
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              Total Rooms
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 text-lg font-bold">
              🏢
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
            {totalRoomsCount}
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-2">
            {totalBedsCount} total student beds
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              Registered Students
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 text-lg font-bold">
              👥
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
            {registeredStudentsCount}
          </p>
          <p className="text-xs sm:text-sm font-bold text-blue-700 mt-2">
            {students.filter((s) => s.preferences && s.preferences.length > 0).length} preferences ranked
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              Allotted Students
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 text-lg font-bold">
              ✓
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-emerald-800 tracking-tight mt-3">
            {allottedStudentsCount}
          </p>
          <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-2">
            {pendingStudentsCount > 0 ? `${pendingStudentsCount} students pending` : 'All registered allotted'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              Occupancy Rate
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 text-lg font-bold">
              %
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-indigo-900 tracking-tight mt-3">
            {occupancyPct}%
          </p>
          <p className="text-xs sm:text-sm font-bold text-indigo-700 mt-2">
            {allottedStudentsCount} of {totalBedsCount} beds occupied
          </p>
        </div>
      </div>

      {/* 2 Column Layout: Occupancy by Block & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Occupancy by Block (RNT Hostel)
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Current bed allotment distribution across 5 blocks
            </p>
          </div>

          <div className="space-y-5">
            {blockStats.map((b) => (
              <div key={b.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base sm:text-lg font-bold text-slate-900">{b.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-base font-bold text-slate-600">
                      {b.allotted} / {b.capacity} beds
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 w-12 text-right">
                      {b.pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00695c] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(b.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Quick Actions
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mb-6">
              Direct shortcuts to hostel administrative workflows
            </p>

            <div className="space-y-3.5">
              <button
                type="button"
                onClick={() => navigate('/admin-dashboard/results')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 text-emerald-950 border border-emerald-200 hover:bg-emerald-100/70 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚡</span>
                  <div className="text-left">
                    <span className="text-base font-bold block">Run Gale-Shapley</span>
                    <span className="text-xs font-semibold text-emerald-800 block">Execute matching algorithm</span>
                  </div>
                </div>
                <span className="text-lg font-bold">→</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin-dashboard/add-room')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">➕</span>
                  <div className="text-left">
                    <span className="text-base font-bold block">Add New Room</span>
                    <span className="text-xs font-semibold text-slate-500 block">Expand RNT inventory</span>
                  </div>
                </div>
                <span className="text-lg font-bold">→</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin-dashboard/students')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <div className="text-left">
                    <span className="text-base font-bold block">View Students</span>
                    <span className="text-xs font-semibold text-slate-500 block">Inspect ranked preferences</span>
                  </div>
                </div>
                <span className="text-lg font-bold">→</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600 mt-4">
            💡 <strong>Notice:</strong> All matching uses Gale-Shapley algorithm to ensure Pareto optimality and eliminate room allocation disputes.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
