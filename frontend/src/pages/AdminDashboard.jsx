import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [tab, setTab] = useState('overview'); // 'overview' | 'rooms' | 'students' | 'allotment'
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');
  const [matchSuccess, setMatchSuccess] = useState(false);

  // Add Room Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newBlock, setNewBlock] = useState('Block A');
  const [newFloor, setNewFloor] = useState('1');
  const [newCapacity, setNewCapacity] = useState('1');
  const [newType, setNewType] = useState('single');
  const [addRoomLoading, setAddRoomLoading] = useState(false);
  const [addRoomError, setAddRoomError] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, studentsRes, allotsRes] = await Promise.all([
        fetch(`${API}/api/rooms`),
        fetch(`${API}/api/allotments/admin-students`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/allotments`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (roomsRes.ok) {
        const rData = await roomsRes.json();
        setRooms(rData.rooms || []);
      }

      if (studentsRes.ok) {
        const sData = await studentsRes.json();
        setStudents(sData.students || []);
      }

      if (allotsRes.ok) {
        const aData = await allotsRes.json();
        setAllotments(aData.allotments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API, token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Run Gale-Shapley Allotment
  const handleRunAllotment = async () => {
    setMatching(true);
    setMatchMessage('');
    try {
      const response = await fetch(`${API}/api/match/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMatchSuccess(true);
        setMatchMessage(
          `Allotment executed successfully: ${data.matchedCount} students matched, ${data.unmatchedCount} unmatched.`
        );
        await fetchData();
      } else {
        setMatchSuccess(false);
        setMatchMessage(data.message || 'Matching failed');
      }
    } catch (err) {
      setMatchSuccess(false);
      setMatchMessage('Server error during matching execution.');
    } finally {
      setMatching(false);
    }
  };

  // Reset Allotments
  const handleResetAllotment = async () => {
    if (!window.confirm('Are you sure you want to reset all room allotments?')) return;
    setResetting(true);
    setMatchMessage('');
    try {
      const response = await fetch(`${API}/api/match/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMatchSuccess(true);
        setMatchMessage('Allotments reset successfully. All students are now unallotted.');
        await fetchData();
      } else {
        setMatchSuccess(false);
        setMatchMessage(data.message || 'Reset failed');
      }
    } catch (err) {
      setMatchSuccess(false);
      setMatchMessage('Server error during reset.');
    } finally {
      setResetting(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete Room ${roomNumber}?`)) return;
    try {
      const response = await fetch(`${API}/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchData();
      } else {
        alert('Failed to delete room');
      }
    } catch (err) {
      alert('Error deleting room');
    }
  };

  // Add Room
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    setAddRoomLoading(true);
    setAddRoomError('');
    try {
      const response = await fetch(`${API}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          room_number: newRoomNumber.trim(),
          hostel_block: newBlock,
          floor: Number(newFloor),
          capacity: Number(newCapacity),
          room_type: newType,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowAddModal(false);
        setNewRoomNumber('');
        await fetchData();
      } else {
        setAddRoomError(data.message || 'Failed to add room');
      }
    } catch (err) {
      setAddRoomError('Error connecting to server.');
    } finally {
      setAddRoomLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Branch', 'Year', 'Allotted Room', 'Hostel Block', 'Preferences Count'];
    const rows = students.map((s) => [
      `"${s.name || ''}"`,
      `"${s.roll_number || ''}"`,
      `"${s.branch || ''}"`,
      `"${s.year || ''}"`,
      `"${s.allotted_room_number || 'Unallotted'}"`,
      `"${s.allotted_block || ''}"`,
      s.preferences ? s.preferences.length : 0,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NIT_Agartala_Allotment_Results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Metrics calculations
  const totalRoomsCount = rooms.length;
  const totalBedsCount = rooms.reduce((acc, r) => acc + (Number(r.capacity) || 1), 0);
  const registeredStudentsCount = students.length;
  const allottedStudentsCount = students.filter((s) => s.allotted_room_number).length;
  const pendingStudentsCount = registeredStudentsCount - allottedStudentsCount;
  const occupancyPct = totalBedsCount > 0 ? Math.round((allottedStudentsCount / totalBedsCount) * 100) : 0;

  // Occupancy per room map (roomId -> count of allotted students)
  const roomOccupancyMap = {};
  students.forEach((s) => {
    if (s.allotted_room_id) {
      roomOccupancyMap[s.allotted_room_id] = (roomOccupancyMap[s.allotted_room_id] || 0) + 1;
    }
  });

  // Occupancy by Block (for RNT Hostel: Block A, Block B, Block C, Block D, Block E)
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
          {/* Navigation Tabs (Overview, Rooms, Students, Allotment) */}
          <div className="flex bg-slate-200/70 p-1.5 rounded-2xl mb-8 w-fit gap-1 text-base font-bold">
            <button
              type="button"
              onClick={() => setTab('overview')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
                tab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📊 Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('rooms')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all ${
                tab === 'rooms'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏢 Rooms</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {rooms.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab('students')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all ${
                tab === 'students'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👥 Students</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {students.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab('allotment')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all ${
                tab === 'allotment'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⚡ Allotment</span>
              {allottedStudentsCount > 0 && (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {allottedStudentsCount}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600 text-base font-medium">Loading administrative hostel data...</p>
            </div>
          ) : (
            <>
              {/* ================= TAB 1: OVERVIEW ================= */}
              {tab === 'overview' && (
                <div className="space-y-8">
                  {/* Overview Header */}
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
                    {/* Stat Card 1: Total Rooms */}
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

                    {/* Stat Card 2: Registered Students */}
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

                    {/* Stat Card 3: Allotted Students */}
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

                    {/* Stat Card 4: Occupancy Rate */}
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

                  {/* 2 Column Layout: Occupancy by Block (Left) & Quick Actions (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Occupancy by Block */}
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

                    {/* Right 1 Col: Quick Actions */}
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
                            onClick={() => {
                              setTab('allotment');
                            }}
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
                            onClick={() => {
                              setShowAddModal(true);
                            }}
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
                            onClick={handleExportCSV}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100 transition"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">📥</span>
                              <div className="text-left">
                                <span className="text-base font-bold block">Export Allotments</span>
                                <span className="text-xs font-semibold text-slate-500 block">Download CSV spreadsheet</span>
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
              )}

              {/* ================= TAB 2: ROOMS (No Rent Column) ================= */}
              {tab === 'rooms' && (
                <div className="space-y-6">
                  {/* Top bar with search and Add Room button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        RNT Hostel Rooms Directory
                      </h2>
                      <p className="text-sm sm:text-base text-slate-600 mt-1">
                        Manage inventory across Blocks A, B, C, D, E (Floors 1 to 5)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="px-6 py-3 rounded-xl bg-[#00695c] hover:bg-[#00574b] text-white text-sm sm:text-base font-bold shadow-xs transition flex items-center gap-2 w-fit"
                    >
                      <span>➕</span>
                      <span>Add New Room</span>
                    </button>
                  </div>

                  {/* Rooms Table Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200/80 text-xs sm:text-sm uppercase font-bold tracking-wider text-slate-600">
                            <th className="py-4 px-6">Room Number</th>
                            <th className="py-4 px-6">Hostel Block</th>
                            <th className="py-4 px-6">Floor</th>
                            <th className="py-4 px-6">Type</th>
                            <th className="py-4 px-6">Capacity</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm sm:text-base font-medium text-slate-800">
                          {rooms.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                                No rooms recorded in database. Click &ldquo;Add New Room&rdquo; to add.
                              </td>
                            </tr>
                          ) : (
                            rooms.map((r) => {
                              const occupied = roomOccupancyMap[r.id] || 0;
                              const isFull = occupied >= (Number(r.capacity) || 1);

                              return (
                                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                                  <td className="py-4.5 px-6 font-black text-slate-900 text-base sm:text-lg">
                                    Room {r.room_number}
                                  </td>
                                  <td className="py-4.5 px-6 font-semibold text-slate-700">
                                    {r.hostel_block}
                                  </td>
                                  <td className="py-4.5 px-6 text-slate-700">
                                    Floor {r.floor ?? 1}
                                  </td>
                                  <td className="py-4.5 px-6 capitalize text-slate-700">
                                    {r.room_type || 'Single'}
                                  </td>
                                  <td className="py-4.5 px-6 text-slate-700">
                                    {r.capacity} Bed{r.capacity > 1 ? 's' : ''} ({occupied} occupied)
                                  </td>
                                  <td className="py-4.5 px-6">
                                    <span
                                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                                        !isFull
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                                      }`}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${!isFull ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                      {!isFull ? 'Available' : 'Full'}
                                    </span>
                                  </td>
                                  <td className="py-4.5 px-6 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteRoom(r.id, r.room_number)}
                                      className="px-3.5 py-1.5 text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: STUDENTS (No Reg Timestamp) ================= */}
              {tab === 'students' && (
                <div className="space-y-6">
                  {/* Students Tab Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Registered Students &amp; Preferences
                      </h2>
                      <p className="text-sm sm:text-base text-slate-600 mt-1">
                        View registered students, their ranked room choices, and allotment status
                      </p>
                    </div>

                    <span className="text-sm font-bold px-4 py-2 rounded-full bg-slate-100 text-slate-700 w-fit">
                      Total: {students.length} Students
                    </span>
                  </div>

                  {/* Student Cards List */}
                  {students.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
                      <div className="text-5xl mb-3">👥</div>
                      <h3 className="text-xl font-bold text-slate-800">No students registered yet</h3>
                      <p className="text-sm sm:text-base text-slate-500 mt-1">
                        Students will show up here once they create an account and submit preferences.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {students.map((student) => {
                        const isAllotted = Boolean(student.allotted_room_number);

                        return (
                          <div
                            key={student.id}
                            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:border-slate-300 transition space-y-4"
                          >
                            {/* Top row: Avatar, Name, Program, Allotment status */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#004d40] text-emerald-200 flex items-center justify-center font-black text-lg shadow-xs">
                                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                                      {student.name}
                                    </h3>
                                    <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                      {student.roll_number || 'Roll Pending'}
                                    </span>
                                  </div>
                                  <p className="text-sm sm:text-base font-medium text-slate-600 mt-1">
                                    {student.branch || 'B.Tech'} · Year {student.year || '1'} · {student.email}
                                  </p>
                                </div>
                              </div>

                              <div>
                                {isAllotted ? (
                                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-bold">
                                    ✓ Allotted: Room {student.allotted_room_number} ({student.allotted_block})
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs sm:text-sm font-bold">
                                    ⏳ Unallotted
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bottom row: Preferences pills in order */}
                            <div className="pt-4 border-t border-slate-100">
                              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Preferences Submitted (in rank order):
                              </p>
                              {student.preferences && student.preferences.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {student.preferences.map((pref, idx) => {
                                    const isThisAllotted =
                                      isAllotted && student.allotted_room_number === pref.room_number;

                                    return (
                                      <span
                                        key={idx}
                                        className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border ${
                                          isThisAllotted
                                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20'
                                            : 'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}
                                      >
                                        <span className="opacity-60">#{idx + 1}</span>
                                        <span>Room {pref.room_number}</span>
                                        <span className="text-slate-400">({pref.hostel_block})</span>
                                        {isThisAllotted && <span className="text-emerald-700 font-black">✓</span>}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400 italic">
                                  No room preferences ranked yet.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 4: ALLOTMENT ================= */}
              {tab === 'allotment' && (
                <div className="space-y-6">
                  {/* Header & Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Gale-Shapley Allotment Engine
                      </h2>
                      <p className="text-sm sm:text-base text-slate-600 mt-1">
                        Run stable matching for NIT Agartala RNT Hostel applicants
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Reset Button */}
                      <button
                        type="button"
                        onClick={handleResetAllotment}
                        disabled={resetting || allottedStudentsCount === 0}
                        className="px-5 py-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 border border-rose-200 text-sm sm:text-base font-bold transition flex items-center gap-2"
                      >
                        {resetting ? 'Resetting...' : '↺ Reset Allotments'}
                      </button>

                      {/* Export CSV */}
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm sm:text-base font-bold shadow-xs transition flex items-center gap-2"
                      >
                        <span>📥</span>
                        <span>Export CSV</span>
                      </button>

                      {/* Run Gale-Shapley Algorithm */}
                      <button
                        type="button"
                        onClick={handleRunAllotment}
                        disabled={matching}
                        className="px-6 py-3 rounded-xl bg-[#00695c] hover:bg-[#00574b] active:bg-[#004d40] disabled:opacity-60 text-white text-sm sm:text-base font-bold shadow-md transition flex items-center gap-2"
                      >
                        {matching ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Running Matching...</span>
                          </>
                        ) : (
                          <>
                            <span>⚡</span>
                            <span>Run Allotment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Match Banner Message */}
                  {matchMessage && (
                    <div
                      className={`p-4 rounded-2xl border text-sm sm:text-base font-bold flex items-center gap-3 ${
                        matchSuccess
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : 'bg-rose-50 text-rose-900 border-rose-300'
                      }`}
                    >
                      <span className="text-xl">{matchSuccess ? '✓' : '⚠️'}</span>
                      <span>{matchMessage}</span>
                    </div>
                  )}

                  {/* Matching Results Table */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200/80 text-xs sm:text-sm uppercase font-bold tracking-wider text-slate-600">
                            <th className="py-4 px-6">Student Name</th>
                            <th className="py-4 px-6">Roll Number</th>
                            <th className="py-4 px-6">Branch &amp; Year</th>
                            <th className="py-4 px-6">Allotted Room</th>
                            <th className="py-4 px-6">Hostel Block</th>
                            <th className="py-4 px-6">Floor</th>
                            <th className="py-4 px-6">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm sm:text-base font-medium text-slate-800">
                          {students.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                                No registered students available for allotment.
                              </td>
                            </tr>
                          ) : (
                            students.map((s) => {
                              const isAllotted = Boolean(s.allotted_room_number);

                              return (
                                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                                  <td className="py-4.5 px-6 font-black text-slate-900">
                                    {s.name}
                                  </td>
                                  <td className="py-4.5 px-6 font-semibold text-slate-700">
                                    {s.roll_number || '—'}
                                  </td>
                                  <td className="py-4.5 px-6 text-slate-600">
                                    {s.branch || 'B.Tech'} (Year {s.year || 1})
                                  </td>
                                  <td className="py-4.5 px-6">
                                    {isAllotted ? (
                                      <span className="font-black text-[#00695c] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-sm sm:text-base">
                                        Room {s.allotted_room_number}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic">Unallotted</span>
                                    )}
                                  </td>
                                  <td className="py-4.5 px-6 font-semibold text-slate-700">
                                    {s.allotted_block || '—'}
                                  </td>
                                  <td className="py-4.5 px-6 text-slate-700">
                                    {s.allotted_floor ? `Floor ${s.allotted_floor}` : '—'}
                                  </td>
                                  <td className="py-4.5 px-6">
                                    <span
                                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                                        isAllotted
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                                      }`}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${isAllotted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                      {isAllotted ? 'Allotted' : 'Pending'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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

      {/* ================= ADD ROOM MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-slate-900">Add Room to RNT Hostel</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {addRoomError && (
              <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3.5 rounded-xl text-sm font-semibold mb-4">
                {addRoomError}
              </div>
            )}

            <form onSubmit={handleAddRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Room Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A-105"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:ring-2 focus:ring-[#00695c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Hostel Block (RNT Hostel)
                </label>
                <select
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:ring-2 focus:ring-[#00695c] focus:outline-none"
                >
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                  <option value="Block D">Block D</option>
                  <option value="Block E">Block E</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Floor
                  </label>
                  <select
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:ring-2 focus:ring-[#00695c] focus:outline-none"
                  >
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                    <option value="4">Floor 4</option>
                    <option value="5">Floor 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Capacity (Beds)
                  </label>
                  <select
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:ring-2 focus:ring-[#00695c] focus:outline-none"
                  >
                    <option value="1">1 Bed</option>
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Room Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:ring-2 focus:ring-[#00695c] focus:outline-none"
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addRoomLoading}
                  className="px-6 py-3 rounded-xl bg-[#00695c] hover:bg-[#00574b] text-white font-bold text-sm shadow-xs"
                >
                  {addRoomLoading ? 'Adding...' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;