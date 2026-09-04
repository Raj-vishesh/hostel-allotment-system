import { useState } from 'react';

function AddRoom() {
  // Har form field ke liye alag state - controlled components
  const [roomNumber, setRoomNumber] = useState('');
  const [hostelBlock, setHostelBlock] = useState('');
  const [capacity, setCapacity] = useState('');
  const [floor, setFloor] = useState('');
  const [roomType, setRoomType] = useState('');

  // Success/error messages dikhane ke liye
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleAddRoom = async (e) => {
    e.preventDefault(); // page reload rokna hai

    // localStorage se token nikaal rahe hain - jo login ke time save hua tha
    const token = localStorage.getItem('token');
   

    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Template literal se "Bearer <token>" bana rahe hain
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_number: roomNumber,
          hostel_block: hostelBlock,
          capacity: capacity,
          floor: floor,
          room_type: roomType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.message);
        return;
      }

      // Success - message dikhao aur form clear kar do
      setIsError(false);
      setMessage('Room added successfully!');
      setRoomNumber('');
      setHostelBlock('');
      setCapacity('');
      setFloor('');
      setRoomType('');
    } catch (err) {
      setIsError(true);
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Add Room</h1>
        <p className="text-slate-500 text-sm mb-6">Fill in the room details below</p>

        {message && (
          <div
            className={`text-sm rounded-lg px-4 py-2 mb-4 border ${
              isError
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-green-50 border-green-200 text-green-600'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleAddRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hostel Block
            </label>
            <input
              type="text"
              value={hostelBlock}
              onChange={(e) => setHostelBlock(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Block A"
            />
          </div>

          {/* Do fields ek row mein - grid use kar rahe hain */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Floor
              </label>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Room Type
            </label>
            <input
              type="text"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. double"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium 
                       py-2.5 rounded-lg transition duration-200"
          >
            Add Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRoom;