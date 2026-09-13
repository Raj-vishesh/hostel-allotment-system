import { useState, useEffect } from 'react';

function MyAllotment() {
  const [allotment, setAllotment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAllotment = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:5000/api/allotments/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message);
          return;
        }

        setAllotment(data.allotment);
      } catch (err) {
        setMessage('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllotment();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-slate-500">Loading your allotment...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">
          Your Room Allotment
        </h1>

        {allotment ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-slate-500">Room Number</p>
                <p className="text-2xl font-bold text-blue-600">{allotment.room_number}</p>
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
                <p className="font-medium text-slate-800">{allotment.room_type}</p>
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
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <p className="text-slate-500">{message || 'No allotment found yet.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAllotment;