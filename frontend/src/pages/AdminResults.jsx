import { useState, useEffect } from 'react';

function AdminResults() {
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllotments = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:5000/api/allotments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message);
          return;
        }

        setAllotments(data.allotments);
      } catch (err) {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllotments();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-slate-500">Loading results...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Allotment Results</h1>
        <p className="text-slate-500 text-sm mb-6">{allotments.length} students matched</p>

        <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Block</th>
                <th className="px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {allotments.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.student_name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.roll_number}</td>
                  <td className="px-4 py-3 text-slate-600">{item.room_number}</td>
                  <td className="px-4 py-3 text-slate-600">{item.hostel_block}</td>
                  <td className="px-4 py-3 text-slate-600">{item.room_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminResults;