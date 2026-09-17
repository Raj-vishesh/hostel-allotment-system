import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [tab, setTab] = useState('browse');
  const [rooms, setRooms] = useState([]);
  const [preferences, setPreferences] = useState([]); // array of room objects, in order
  const [allotment, setAllotment] = useState(null);
  const [allotmentChecked, setAllotmentChecked] = useState(false);
  const [search, setSearch] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Student';
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL;

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
            .map((p) => allRooms.find((r) => r.id === p.room_id))
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
  }, []);

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
      setSaveMsg(response.ok ? 'Preferences saved successfully.' : data.message);
    } catch (err) {
      setSaveMsg('Something went wrong. Please try again.');
    }
  };

  const filteredRooms = rooms.filter(
    (r) =>
      r.room_number.toLowerCase().includes(search.toLowerCase()) ||
      r.hostel_block.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white text-lg">
            🎓
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">Vishwa University</p>
            <p className="text-xs text-slate-400 leading-tight">Student Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800">{name}</p>
            <p className="text-xs text-slate-400">Student</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
            {name.charAt(0)}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg transition"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome row */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome, {name.split(' ')[0]}</h1>
          </div>
          {allotmentChecked && (
            <span
              className={`text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                allotment ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {allotment ? '✓ Room allotted' : 'Awaiting allotment'}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setTab('browse')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === 'browse' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
            }`}
          >
            Browse rooms
          </button>
          <button
            onClick={() => setTab('preferences')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 ${
              tab === 'preferences' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
            }`}
          >
            My preferences
            {preferences.length > 0 && (
              <span className="bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded-full">
                {preferences.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('allotment')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === 'allotment' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
            }`}
          >
            My allotment
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-center mt-10">Loading...</p>
        ) : (
          <>
            {/* Browse Rooms Tab */}
            {tab === 'browse' && (
              <div>
                <input
                  type="text"
                  placeholder="Search by room number or block..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full max-w-md border border-slate-300 rounded-lg px-4 py-2.5 mb-6
                             focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                {filteredRooms.length === 0 ? (
                  <p className="text-slate-400 text-center mt-10">No rooms found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRooms.map((room) => {
                      const added = preferences.some((p) => p.id === room.id);
                      return (
                        <div
                          key={room.id}
                          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 text-lg">
                              🛏️
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-slate-800">
                                  Room {room.room_number}
                                </h3>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    room.is_available
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {room.is_available ? 'Available' : 'Full'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 capitalize">{room.room_type}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 border-t border-slate-100 pt-3">
                            <div>
                              <p className="text-slate-400 text-xs">Block</p>
                              <p className="font-medium">{room.hostel_block}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs">Floor</p>
                              <p className="font-medium">{room.floor ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs">Capacity</p>
                              <p className="font-medium">{room.capacity}</p>
                            </div>
                          </div>

                          <div className="mt-4">
                            {added ? (
                              <button
                                onClick={() => removeFromPreferences(room.id)}
                                className="w-full text-sm border border-red-200 text-red-600 hover:bg-red-50
                                           py-2 rounded-lg transition"
                              >
                                ✕ Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => addToPreferences(room)}
                                className="w-full text-sm bg-teal-700 hover:bg-teal-800 text-white
                                           py-2 rounded-lg transition"
                              >
                                + Add to preferences
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

            {/* My Preferences Tab */}
            {tab === 'preferences' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-slate-800">Your ranked choices</h2>
                    <span className="text-xs text-slate-400">Ranked highest to lowest</span>
                  </div>

                  {preferences.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
                      No rooms added yet. Go to "Browse rooms" to add some.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {preferences.map((room, index) => (
                        <div
                          key={room.id}
                          className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-slate-800">
                                Room {room.room_number} · {room.hostel_block}
                              </p>
                              <p className="text-xs text-slate-400 capitalize">{room.room_type}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-400">
                            <button
                              onClick={() => moveUp(index)}
                              disabled={index === 0}
                              className="disabled:opacity-30 hover:text-slate-700"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveDown(index)}
                              disabled={index === preferences.length - 1}
                              className="disabled:opacity-30 hover:text-slate-700"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removeFromPreferences(room.id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
                  <h3 className="font-semibold text-slate-800 mb-2">Submit your list</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Allotment uses a stable-matching algorithm based on your ranked order and each
                    room's available capacity — not just registration time.
                  </p>
                  {saveMsg && (
                    <p
                      className={`text-sm mb-3 ${
                        saveMsg.includes('success') ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {saveMsg}
                    </p>
                  )}
                  <button
                    onClick={savePreferences}
                    disabled={preferences.length === 0}
                    className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white
                               font-medium py-2.5 rounded-lg transition"
                  >
                    Save preferences
                  </button>
                </div>
              </div>
            )}

            {/* My Allotment Tab */}
            {tab === 'allotment' && (
              <div className="max-w-md">
                {allotment ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-slate-400">Room Number</p>
                        <p className="text-2xl font-bold text-teal-700">{allotment.room_number}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                        Allotted
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-slate-400">Hostel Block</p>
                        <p className="font-medium text-slate-800">{allotment.hostel_block}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Room Type</p>
                        <p className="font-medium text-slate-800 capitalize">{allotment.room_type}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Capacity</p>
                        <p className="font-medium text-slate-800">{allotment.capacity}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Allotted On</p>
                        <p className="font-medium text-slate-800">
                          {new Date(allotment.matched_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
                    No allotment yet. Results will appear here once the admin runs the matching process.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;