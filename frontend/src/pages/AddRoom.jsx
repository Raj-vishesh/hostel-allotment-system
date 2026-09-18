import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddRoom() {
  const [roomNumber, setRoomNumber] = useState('');
  const [hostelBlock, setHostelBlock] = useState('Block A');
  const [capacity, setCapacity] = useState('1');
  const [floor, setFloor] = useState('1');
  const [roomType, setRoomType] = useState('single');

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_number: roomNumber.trim(),
          hostel_block: hostelBlock,
          capacity: Number(capacity),
          floor: Number(floor),
          room_type: roomType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.message || 'Failed to add room');
        return;
      }

      setIsError(false);
      setMessage(`Room ${roomNumber} (${hostelBlock}, Floor ${floor}) added successfully to RNT Hostel!`);
      setRoomNumber('');
    } catch (err) {
      setIsError(true);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 sm:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold mb-2">
              <span>🏢 RNT Hostel (5 Blocks · 5 Floors)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Add Residence Room</h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">Register a new room for NIT Agartala RNT Hall of Residence.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/rooms')}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold transition"
          >
            ← Back to Rooms
          </button>
        </div>

        {message && (
          <div
            className={`text-sm sm:text-base rounded-2xl px-4 py-3.5 mb-6 border flex items-center gap-2.5 font-semibold ${
              isError
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <span>{isError ? '⚠️' : '✓'}</span>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleAddRoom} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Room Number
            </label>
            <input
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] transition"
              placeholder="e.g. A-103 or B-302"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Hostel Block
              </label>
              <select
                value={hostelBlock}
                onChange={(e) => setHostelBlock(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] transition"
              >
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
                <option value="Block D">Block D</option>
                <option value="Block E">Block E</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Floor Level
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] transition"
              >
                <option value="1">Floor 1 (Ground)</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
                <option value="4">Floor 4</option>
                <option value="5">Floor 5</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Capacity (Beds)
              </label>
              <input
                type="number"
                min="1"
                max="4"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] transition"
                placeholder="1 or 2"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Room Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] transition"
              >
                <option value="single">Single Occupancy</option>
                <option value="double">Double Occupancy</option>
                <option value="triple">Triple Occupancy</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#00695c] hover:bg-[#00574b] active:bg-[#004d40] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2 text-base"
          >
            {loading ? 'Adding Room...' : '+ Add Room to RNT Hostel'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRoom;