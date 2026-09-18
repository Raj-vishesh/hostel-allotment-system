import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, prefRes] = await Promise.all([
          fetch(`${API}/api/rooms`),
          fetch(`${API}/api/preferences/my`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (roomsRes.ok) {
          const rData = await roomsRes.json();
          setRooms(rData.rooms || []);
        }

        if (prefRes.ok) {
          const pData = await prefRes.json();
          setPreferences(pData.preferences || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API, token]);

  const addToPreferences = async (room) => {
    try {
      const updated = [...preferences, { room_id: room.id, rank_order: preferences.length + 1 }];
      const res = await fetch(`${API}/api/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          preferences: updated.map((p, idx) => ({ room_id: p.room_id, rank_order: idx + 1 })),
        }),
      });
      if (res.ok) {
        setPreferences(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromPreferences = async (roomId) => {
    try {
      const updated = preferences.filter((p) => p.room_id !== roomId);
      const res = await fetch(`${API}/api/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          preferences: updated.map((p, idx) => ({ room_id: p.room_id, rank_order: idx + 1 })),
        }),
      });
      if (res.ok) {
        setPreferences(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRank = (roomId) => {
    const idx = preferences.findIndex((p) => p.room_id === roomId);
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

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-base font-medium">Loading RNT Hostel residence data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row gap-3.5">
          {/* Search Bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search room number (e.g. A-101) or block..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] transition"
            />
          </div>

          {/* Floor Filter */}
          <div className="w-full sm:w-52">
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-base font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c]"
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
          <div className="w-full sm:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-base font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c]"
            >
              <option value="all">All Room Types</option>
              <option value="single">Single Bed</option>
              <option value="double">Double Bed</option>
            </select>
          </div>
        </div>

        {/* Block Pill Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mr-1.5">
              RNT Blocks:
            </span>
            {['all', 'Block A', 'Block B', 'Block C', 'Block D', 'Block E'].map((blk) => (
              <button
                key={blk}
                type="button"
                onClick={() => setSelectedBlock(blk)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
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
          <div className="flex items-center gap-4 text-sm font-semibold">
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
                className="text-emerald-700 hover:text-emerald-900 underline font-bold ml-2"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preferences Summary Banner */}
      {preferences.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⭐</span>
            <span className="text-sm sm:text-base font-bold text-emerald-900">
              You have selected {preferences.length} room{preferences.length > 1 ? 's' : ''} in your preference list.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/student-dashboard/preferences')}
            className="px-4 py-2 rounded-xl bg-[#00695c] text-white text-sm font-bold hover:bg-[#00574b] transition shadow-xs whitespace-nowrap"
          >
            Review &amp; Reorder →
          </button>
        </div>
      )}

      {/* Rooms Cards Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 text-center border border-slate-200/80 shadow-xs">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-800">No rooms match your filters</h3>
          <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-md mx-auto">
            Try clearing or relaxing your search criteria to see rooms across all 5 blocks of RNT Hostel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const rank = getRank(room.id);
            const isAdded = rank !== null;

            return (
              <div
                key={room.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                  isAdded
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Top row: Room Number & Availability badge */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-800 text-2xl shadow-xs">
                        🛏️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Room {room.room_number}
                          </h3>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">
                          RNT Hostel · {room.hostel_block}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-2 ${
                        room.is_available
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border border-rose-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${room.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {room.is_available ? 'Available' : 'Full'}
                    </span>
                  </div>

                  {/* Specs grid */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-center my-4">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Floor</p>
                      <p className="text-sm sm:text-base font-extrabold text-slate-800 mt-1">Floor {room.floor ?? 1}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Capacity</p>
                      <p className="text-sm sm:text-base font-extrabold text-slate-800 mt-1">{room.capacity} Bed{room.capacity > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Type</p>
                      <p className="text-sm sm:text-base font-extrabold text-slate-800 mt-1 capitalize">{room.room_type || 'Single'}</p>
                    </div>
                  </div>

                  {/* Amenities badges */}
                  <div className="flex flex-wrap gap-2 my-3">
                    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">📶 Wi-Fi</span>
                    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">🪑 Study Table</span>
                    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">⚡ 24/7 Power</span>
                  </div>
                </div>

                {/* Preference Action Button */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  {isAdded ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-center py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-300">
                        ✓ In Preferences (Rank #{rank})
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromPreferences(room.id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                        title="Remove from preferences"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToPreferences(room)}
                      className="w-full py-3 px-4 rounded-xl text-sm sm:text-base font-bold bg-[#00695c] hover:bg-[#00574b] text-white shadow-xs transition flex items-center justify-center gap-2"
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
  );
}

export default RoomList;