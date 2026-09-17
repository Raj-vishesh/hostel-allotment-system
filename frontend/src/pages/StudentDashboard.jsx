import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [tab, setTab] = useState('browse');
  const [rooms, setRooms] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [allotment, setAllotment] = useState(null);
  const [allotmentChecked, setAllotmentChecked] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Student';
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const load = async () => {
      try {
        const [roomsRes, prefRes, allotRes] = await Promise.all([
          fetch(`${API}/api/rooms`),
          fetch(`${API}/api/preferences/my`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/allotments/my`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const roomsData = await roomsRes.json();
        const allRooms = roomsData.rooms || [];
        setRooms(allRooms);

        if (prefRes.ok) {
          const prefData = await prefRes.json();
          const ordered = prefData.preferences
            .sort((a, b) => a.rank_order - b.rank_order)
            .map((p) => {
              const matched = allRooms.find((r) => r.id === p.room_id);
              return matched || {
                id: p.room_id,
                room_number: p.room_number,
                hostel_block: p.hostel_block,
                floor: p.floor,
                room_type: p.room_type,
                capacity: p.capacity,
              };
            })
            .filter(Boolean);
          setPreferences(ordered);
        }

        if (allotRes.ok) {
          const allotData = await allotRes.json();
          setAllotment(allotData.allotment);
        }
        setAllotmentChecked(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API, token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const addToPreferences = (room) => {
    if (preferences.some((p) => p.id === room.id)) return;
    setPreferences([...preferences, room]);
  };

  const removeFromPreferences = (roomId) => {
    setPreferences(preferences.filter((p) => p.id !== roomId));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...preferences];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setPreferences(updated);
  };

  const moveDown = (index) => {
    if (index === preferences.length - 1) return;
    const updated = [...preferences];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setPreferences(updated);
  };

  const savePreferences = async () => {
    setSaveMsg('');
    setSaving(true);
    try {
      const body = {
        preferences: preferences.map((room, index) => ({
          room_id: room.id,
          rank_order: index + 1,
        })),
      };
      const response = await fetch(`${API}/api/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        setSaveSuccess(true);
        setSaveMsg('Preferences submitted successfully! Your choices are saved for Gale-Shapley matching.');
      } else {
        setSaveSuccess(false);
        setSaveMsg(data.message || 'Failed to save preferences');
      }
    } catch (err) {
      setSaveSuccess(false);
      setSaveMsg('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRank = (roomId) => {
    const idx = preferences.findIndex((p) => p.id === roomId);
    return idx >= 0 ? idx + 1 : null;
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.hostel_block?.toLowerCase().includes(search.toLowerCase());
    const matchesBlock = selectedBlock === 'all' || r.hostel_block === selectedBlock;
    const matchesFloor = selectedFloor === 'all' || String(r.floor) === String(selectedFloor);
    const matchesType = selectedType === 'all' || r.room_type?.toLowerCase() === selectedType.toLowerCase();
    const matchesAvailability = !onlyAvailable || Boolean(r.is_available);
    return matchesSearch && matchesBlock && matchesFloor && matchesType && matchesAvailability;
  });

  const availableCount = rooms.filter((r) => r.is_available).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <div>
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* College Branding */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#004d40] text-emerald-200 flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 tracking-tight text-base leading-tight">
                      NIT Agartala
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      RNT Hostel
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block leading-tight">
                    Rabindranath Tagore Hall of Residence · 2026–27
                  </span>
                </div>
              </div>

              {/* Student Profile & Sign Out */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{name}</p>
                  <p className="text-xs text-slate-400">Student Portal</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#004d40]/10 border border-[#004d40]/20 text-[#004d40] flex items-center justify-center text-sm font-bold shadow-xs">
                  {name.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-medium border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 px-3 py-1.5 rounded-xl transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
          {/* Welcome Banner & Status Strip */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs mb-8 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Welcome, {name.split(' ')[0]}!
                  </h1>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                  R.N. Tagore (RNT) Hostel features <strong>5 Residential Blocks (A to E)</strong> across <strong>5 Floors each</strong>.
                  Browse available rooms, rank your choices, and save your list. Allotment is decided by the <strong>Gale-Shapley stable matching algorithm</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {allotmentChecked && (
                  <div
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                      allotment
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-xs'
                        : 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-xs'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${allotment ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span>{allotment ? `Allotted: Room ${allotment.room_number}` : 'Allotment Pending'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 text-slate-700">
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Hostel</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">RNT Hostel</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Structure</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">5 Blocks · 5 Floors</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Available</p>
                <p className="text-base font-bold text-emerald-700 mt-0.5">{availableCount} Rooms</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Ranked by You</p>
                <p className="text-base font-bold text-[#00695c] mt-0.5">{preferences.length} Selected</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-8 w-fit gap-1 text-sm font-semibold print:hidden">
            <button
              type="button"
              onClick={() => setTab('browse')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                tab === 'browse'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏢 Browse Rooms</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {rooms.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab('preferences')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                tab === 'preferences'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⭐ My Preferences</span>
              {preferences.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {preferences.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTab('allotment')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                tab === 'allotment'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📋 My Allotment</span>
              {allotment && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-slate-500 text-sm font-medium">Loading RNT Hostel residence data...</p>
            </div>
          ) : (
            <>
              {/* ================= TAB 1: BROWSE ROOMS ================= */}
              {tab === 'browse' && (
                <div className="space-y-6">
                  {/* Search and Filter Controls */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          placeholder="Search room number (e.g. A-101) or block..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                        />
                      </div>

                      {/* Floor Filter */}
                      <div className="w-full sm:w-44">
                        <select
                          value={selectedFloor}
                          onChange={(e) => setSelectedFloor(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c]"
                        >
                          <option value="all">All Floors (1 to 5)</option>
                          <option value="1">Floor 1 (Ground)</option>
                          <option value="2">Floor 2</option>
                          <option value="3">Floor 3</option>
                          <option value="4">Floor 4</option>
                          <option value="5">Floor 5</option>
                        </select>
                      </div>

                      {/* Room Type Filter */}
                      <div className="w-full sm:w-40">
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c]"
                        >
                          <option value="all">All Types</option>
                          <option value="single">Single Bed</option>
                          <option value="double">Double Bed</option>
                        </select>
                      </div>
                    </div>

                    {/* Block Pill Selectors */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1.5">
                          RNT Blocks:
                        </span>
                        {['all', 'Block A', 'Block B', 'Block C', 'Block D', 'Block E'].map((blk) => (
                          <button
                            key={blk}
                            type="button"
                            onClick={() => setSelectedBlock(blk)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                              selectedBlock === blk
                                ? 'bg-[#004d40] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {blk === 'all' ? 'All Blocks' : blk}
                          </button>
                        ))}
                      </div>

                      {/* Only Available Toggle & Clear Filters */}
                      <div className="flex items-center gap-4 text-xs font-medium">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                          <input
                            type="checkbox"
                            checked={onlyAvailable}
                            onChange={(e) => setOnlyAvailable(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span>Available Only</span>
                        </label>

                        {(search || selectedBlock !== 'all' || selectedFloor !== 'all' || selectedType !== 'all' || onlyAvailable) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setSelectedBlock('all');
                              setSelectedFloor('all');
                              setSelectedType('all');
                              setOnlyAvailable(false);
                            }}
                            className="text-emerald-700 hover:text-emerald-900 underline font-semibold"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rooms Cards Grid */}
                  {filteredRooms.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
                      <div className="text-4xl mb-3">🔍</div>
                      <h3 className="text-base font-bold text-slate-800">No rooms match your filters</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Try clearing or relaxing your search criteria to see rooms across all 5 blocks of RNT Hostel.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredRooms.map((room) => {
                        const rank = getRank(room.id);
                        const isAdded = rank !== null;

                        return (
                          <div
                            key={room.id}
                            className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                              isAdded
                                ? 'border-emerald-500/80 shadow-sm ring-2 ring-emerald-500/20'
                                : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                            }`}
                          >
                            <div>
                              {/* Top row: Room Number & Availability badge */}
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 text-lg">
                                    🛏️
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                        Room {room.room_number}
                                      </h3>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">
                                      RNT Hostel · {room.hostel_block}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                                    room.is_available
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${room.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  {room.is_available ? 'Available' : 'Full'}
                                </span>
                              </div>

                              {/* Specs grid */}
                              <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center my-3">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Floor</p>
                                  <p className="text-xs font-bold text-slate-800 mt-0.5">Floor {room.floor ?? 1}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Capacity</p>
                                  <p className="text-xs font-bold text-slate-800 mt-0.5">{room.capacity} Bed{room.capacity > 1 ? 's' : ''}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Type</p>
                                  <p className="text-xs font-bold text-slate-800 mt-0.5 capitalize">{room.room_type || 'Single'}</p>
                                </div>
                              </div>

                              {/* Amenities badges */}
                              <div className="flex flex-wrap gap-1.5 my-2">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">📶 Wi-Fi</span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">🪑 Study Table</span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">⚡ 24/7 Power</span>
                              </div>
                            </div>

                            {/* Preference Action Button */}
                            <div className="mt-4 pt-3 border-t border-slate-100">
                              {isAdded ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                                    ✓ In Preferences (Rank #{rank})
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFromPreferences(room.id)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                                    title="Remove from preferences"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => addToPreferences(room)}
                                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#00695c] hover:bg-[#00574b] text-white shadow-xs transition flex items-center justify-center gap-1.5"
                                >
                                  <span>+ Add to Preferences</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 2: MY PREFERENCES ================= */}
              {tab === 'preferences' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Ranked List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Ranked Room Choices</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Ordered highest to lowest. Rank 1 will be prioritized by the Gale-Shapley matching algorithm.
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                        {preferences.length} Selected
                      </span>
                    </div>

                    {preferences.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
                        <div className="text-4xl mb-3">⭐</div>
                        <h3 className="text-base font-bold text-slate-800">No rooms ranked yet</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
                          Head over to the Browse Rooms tab to explore RNT Hostel rooms and add your top choices.
                        </p>
                        <button
                          type="button"
                          onClick={() => setTab('browse')}
                          className="px-5 py-2.5 rounded-xl bg-[#00695c] text-white text-xs font-semibold hover:bg-[#00574b] transition shadow-xs"
                        >
                          Browse RNT Rooms →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {preferences.map((room, index) => (
                          <div
                            key={room.id}
                            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              {/* Rank Circle */}
                              <div className="w-9 h-9 rounded-xl bg-[#004d40] text-emerald-200 flex items-center justify-center font-bold text-sm shadow-xs">
                                #{index + 1}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    Room {room.room_number}
                                  </h4>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                    {room.hostel_block}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Floor {room.floor ?? '—'} · {room.room_type || 'Single'} Occupancy ({room.capacity ?? 1} Bed)
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons: Move Up, Move Down, Delete */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition"
                                title="Move up in priority"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => moveDown(index)}
                                disabled={index === preferences.length - 1}
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition"
                                title="Move down in priority"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => removeFromPreferences(room.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1"
                                title="Remove from list"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Submission Card & Gale-Shapley Algorithm Explainer */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                      <h3 className="text-base font-bold text-slate-900 mb-2">Submit Your Preference List</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        NIT Agartala uses the <strong>Gale-Shapley stable matching algorithm</strong>.
                        Allotment is strictly based on your ranked order and available room quotas — not first-come-first-served.
                      </p>

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs space-y-1.5 text-slate-600 mb-5">
                        <div className="flex justify-between">
                          <span>Total Rooms Ranked:</span>
                          <span className="font-bold text-slate-900">{preferences.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Top Pick (Rank #1):</span>
                          <span className="font-bold text-emerald-800">
                            {preferences[0] ? `Room ${preferences[0].room_number}` : 'None'}
                          </span>
                        </div>
                      </div>

                      {saveMsg && (
                        <div
                          className={`text-xs p-3 rounded-xl mb-4 border leading-relaxed flex items-start gap-2 ${
                            saveSuccess
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                        >
                          <span>{saveSuccess ? '✓' : '⚠️'}</span>
                          <span>{saveMsg}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={savePreferences}
                        disabled={saving || preferences.length === 0}
                        className="w-full bg-[#00695c] hover:bg-[#00574b] active:bg-[#004d40] disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-md shadow-emerald-950/10 transition flex items-center justify-center gap-2 text-xs"
                      >
                        {saving ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Preferences...</span>
                          </>
                        ) : (
                          <>
                            <span>Save &amp; Confirm Preferences</span>
                            <span>→</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-3xl p-5 text-xs text-emerald-900">
                      <p className="font-bold mb-1 flex items-center gap-1.5">
                        <span>ℹ️</span>
                        <span>Can I change my preferences later?</span>
                      </p>
                      <p className="text-emerald-800/90 leading-relaxed">
                        Yes! You can re-order, add, or remove rooms anytime before the official allotment cycle is executed by the Hostel Warden.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: MY ALLOTMENT ================= */}
              {tab === 'allotment' && (
                <div>
                  {allotment ? (
                    <div className="max-w-3xl mx-auto space-y-6">
                      {/* Official Certificate Card */}
                      <div className="bg-white rounded-3xl border-2 border-[#004d40]/20 shadow-xl overflow-hidden p-6 sm:p-10 relative">
                        {/* Watermark/Emblem styling */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#004d40] text-emerald-200 flex items-center justify-center font-bold text-xl shadow-md">
                              NIT
                            </div>
                            <div>
                              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                                National Institute of Technology Agartala
                              </h2>
                              <p className="text-xs text-emerald-800 font-semibold tracking-wide uppercase mt-0.5">
                                Hostel &amp; Estate Management Division · Allotment Slip
                              </p>
                            </div>
                          </div>

                          <div className="hidden sm:block text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                              ✓ Verified &amp; Confirmed
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1">Academic Session 2026–27</p>
                          </div>
                        </div>

                        {/* Large Allotted Room Callout */}
                        <div className="bg-gradient-to-br from-[#004d40] to-[#00695c] rounded-2xl p-6 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between shadow-lg mb-6">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-emerald-200 font-semibold mb-1">
                              Allotted Residence Room
                            </p>
                            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                              Room {allotment.room_number}
                            </h3>
                            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                              R.N. Tagore (RNT) Hostel · {allotment.hostel_block}
                            </p>
                          </div>

                          <div className="mt-4 sm:mt-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-emerald-400/30 pt-3 sm:pt-0 sm:pl-6">
                            <p className="text-xs text-emerald-200">Floor Level</p>
                            <p className="text-xl font-bold">Floor {allotment.floor || '—'}</p>
                            <p className="text-xs text-emerald-200 mt-1">Type: {allotment.room_type || 'Single'}</p>
                          </div>
                        </div>

                        {/* Student & Allotment Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-xs">
                          <div>
                            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Student Name</span>
                            <span className="font-bold text-slate-800 text-sm block mt-0.5">
                              {allotment.student_name || name}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Roll Number</span>
                            <span className="font-bold text-slate-800 text-sm block mt-0.5">
                              {allotment.roll_number || 'Registered'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Hostel Block</span>
                            <span className="font-bold text-slate-800 text-sm block mt-0.5">
                              {allotment.hostel_block}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Allotted Date</span>
                            <span className="font-bold text-slate-800 text-sm block mt-0.5">
                              {allotment.matched_at ? new Date(allotment.matched_at).toLocaleDateString() : 'Active'}
                            </span>
                          </div>
                        </div>

                        {/* Moving-In Instructions Checklist */}
                        <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                            <span>📋</span>
                            <span>Next Steps for Room Possession &amp; Move-in:</span>
                          </h4>
                          <ul className="space-y-2 text-xs text-slate-600">
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold">1.</span>
                              <span><strong>Key Handover:</strong> Report to the RNT Hostel Warden / Caretaker Office (Ground Floor, Block A) between 9:00 AM – 5:00 PM.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold">2.</span>
                              <span><strong>Identification:</strong> Present your NIT Agartala student ID card and a copy of this allotment slip.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold">3.</span>
                              <span><strong>Inventory Check:</strong> Inspect the electrical points, study table, and room fixtures and submit the check sheet within 48 hours.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold">4.</span>
                              <span><strong>Mess Registration:</strong> Activate your monthly dining subscription at the RNT Hostel Central Mess counter.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Action Buttons: Print Slip */}
                        <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Print Allotment Slip</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Timeline if not yet allotted */
                    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xs text-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center text-2xl mx-auto mb-4">
                        ⏳
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">Room Allotment in Progress</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                        Your application is active for <strong>RNT Hostel (Blocks A to E)</strong>. The Chief Warden office will run the Gale-Shapley matching algorithm once the preference window closes.
                      </p>

                      {/* 4-Stage Tracker */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-8 text-left">
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Step 1</span>
                          <span className="text-xs font-bold text-slate-800 block mt-0.5">Registration</span>
                          <span className="text-[10px] text-emerald-700 block mt-1">✓ Complete</span>
                        </div>
                        <div className={`p-3 rounded-2xl border ${preferences.length > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Step 2</span>
                          <span className="text-xs font-bold text-slate-800 block mt-0.5">Preferences</span>
                          <span className={`text-[10px] block mt-1 ${preferences.length > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                            {preferences.length > 0 ? `✓ ${preferences.length} Ranked` : 'Pending'}
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                          <span className="text-[10px] uppercase font-bold text-amber-800 block">Step 3</span>
                          <span className="text-xs font-bold text-slate-800 block mt-0.5">Gale-Shapley</span>
                          <span className="text-[10px] text-amber-700 block mt-1 font-semibold">⏳ In Progress</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 opacity-60">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Step 4</span>
                          <span className="text-xs font-bold text-slate-700 block mt-0.5">Room Allotment</span>
                          <span className="text-[10px] text-slate-400 block mt-1">Upcoming</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setTab('preferences')}
                        className="px-5 py-2.5 rounded-xl bg-[#00695c] hover:bg-[#00574b] text-white text-xs font-semibold shadow-xs transition"
                      >
                        Review or Update Room Preferences →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* University Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-4 text-center text-xs text-slate-500 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="m-0">
            © 2026–27 <strong>National Institute of Technology Agartala</strong> · R.N. Tagore Hall of Residence
          </p>
          <p className="m-0 text-slate-400">
            For assistance, contact Chief Warden Office at <a href="mailto:hostel@nita.ac.in" className="text-[#00695c] hover:underline">hostel@nita.ac.in</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default StudentDashboard;