import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  useEffect(() => {
    fetchData();
  }, [API, token]);

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

  const roomOccupancyMap = {};
  students.forEach((s) => {
    if (s.allotted_room_id) {
      roomOccupancyMap[s.allotted_room_id] = (roomOccupancyMap[s.allotted_room_id] || 0) + 1;
    }
  });

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-base font-medium">Loading rooms directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          onClick={() => navigate('/admin-dashboard/add-room')}
          className="px-6 py-3 rounded-xl bg-[#00695c] hover:bg-[#00574b] text-white text-sm sm:text-base font-bold shadow-xs transition flex items-center gap-2 w-fit"
        >
          <span>➕</span>
          <span>Add New Room</span>
        </button>
      </div>

      {/* Rooms Table Card (No Rent column) */}
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
  );
}

export default AdminRooms;
