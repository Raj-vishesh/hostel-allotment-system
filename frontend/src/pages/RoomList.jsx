import { useState, useEffect } from 'react';

function RoomList() {
  // Rooms ka data store karne ke liye - shuru mein khali array
  const [rooms, setRooms] = useState([]);
  
  // Loading state - jab tak data aa nahi jata, "Loading..." dikhayenge
  const [loading, setLoading] = useState(true);
  
  // Agar fetch fail ho jaye, error dikhane ke liye
  const [error, setError] = useState('');

  // useEffect - component load hote hi ye chalega (khali array [] ki wajah se)
  useEffect(() => {
    // Async function banaya andar, kyunki useEffect ka callback khud async nahi ho sakta
    const fetchRooms = async () => {
      try {
        // GET request - koi body/token nahi chahiye, ye public route hai
        const response = await fetch('http://localhost:5000/api/rooms');
        const data = await response.json();

        if (!response.ok) {
          setError('Failed to load rooms');
          return;
        }

        // Backend se mila 'rooms' array state mein save kar rahe hain
        setRooms(data.rooms);
      } catch (err) {
        setError('Something went wrong. Please try again.');
      } finally {
        // 'finally' - chahe success ho ya error, ye hamesha chalega
        // Loading ab khatam ho gaya, chahe result kuch bhi ho
        setLoading(false);
      }
    };

    fetchRooms();
  }, []); // khali array - sirf ek baar chalega, page load hote hi

  // Agar loading ho rahi hai, ye dikhao
  if (loading) {
    return <div className="text-center mt-10 text-slate-500">Loading rooms...</div>;
  }

  // Agar error aaya, ye dikhao
  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Available Rooms</h1>

        {/* Agar koi room hi nahi hai */}
        {rooms.length === 0 ? (
          <p className="text-slate-500">No rooms available yet.</p>
        ) : (
          // Grid layout - responsive: mobile mein 1 column, medium screen mein 2, large mein 3
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* rooms array ko map() se loop kar rahe hain - har room ka apna card */}
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow p-5 border border-slate-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Room {room.room_number}
                  </h2>
                  {/* is_available ke hisaab se badge color change hota hai */}
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
                <p className="text-slate-500 text-sm">{room.hostel_block}</p>
                <div className="mt-3 text-sm text-slate-600 space-y-1">
                  <p>Capacity: {room.capacity}</p>
                  <p>Floor: {room.floor}</p>
                  <p>Type: {room.room_type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomList;