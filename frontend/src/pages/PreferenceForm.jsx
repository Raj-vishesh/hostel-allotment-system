import { useState, useEffect } from 'react';

function PreferenceForm() {
  const [rooms, setRooms] = useState([]);
  const [ranks, setRanks] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`);
        const data = await response.json();
        setRooms(data.rooms);
      } catch (err) {
        setIsError(true);
        setMessage('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Ek room ki rank update karta hai - ranks object mein room_id ko key banake rakhte hain
  const handleRankChange = (roomId, value) => {
    setRanks((prev) => ({
      ...prev,
      [roomId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ranks object ko backend ke required format (array) mein convert kar rahe hain
    // sirf wahi rooms bhejenge jinko rank diya gaya hai (khali chhode gaye skip)
    const preferences = Object.entries(ranks)
      .filter(([roomId, rank]) => rank !== '')
      .map(([roomId, rank]) => ({
        room_id: Number(roomId),
        rank_order: Number(rank),
      }));

    if (preferences.length === 0) {
      setIsError(true);
      setMessage('Please rank at least one room');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.message);
        return;
      }

      setIsError(false);
      setMessage('Preferences submitted successfully!');
    } catch (err) {
      setIsError(true);
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-slate-500">Loading rooms...</div>;
  }

   return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Rank Your Room Preferences</h1>
          <p className="text-slate-500 text-sm mt-1">Lower number = higher preference (1 = most preferred)</p>
        </div>

        {message && (
          <div
            className={`text-sm text-center rounded-lg px-4 py-2 mb-6 border ${
              isError
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-green-50 border-green-200 text-green-600'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl shadow-md border-2 border-slate-200 
                           hover:border-blue-400 transition p-5 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Room {room.room_number}
                    </h2>
                    <p className="text-sm text-slate-500">{room.hostel_block}</p>
                  </div>
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

                <div className="text-sm text-slate-600 flex gap-4">
                  <span>Capacity: {room.capacity}</span>
                  <span>Type: {room.room_type}</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                  <label className="text-sm font-medium text-slate-700">
                    Your Rank
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="—"
                    value={ranks[room.id] || ''}
                    onChange={(e) => handleRankChange(room.id, e.target.value)}
                    className="w-16 h-10 border-2 border-slate-300 rounded-lg text-center 
                               font-semibold text-blue-600
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                       py-3 rounded-xl shadow-md transition duration-200"
          >
            Submit Preferences
          </button>
        </form>
      </div>
    </div>
  );
}

export default PreferenceForm;