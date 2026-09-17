import { useState, useEffect } from 'react';

function AdminResults() {
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllotments = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/allotments`, {
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

  // ============ NAYA CODE YAHAN SE SHURU ============
  
  const convertToCSV = (data) => {
    const headers = ['Name', 'Roll Number', 'Room', 'Block', 'Type'];

    const rows = data.map((item) =>
      [item.student_name, item.roll_number, item.room_number, item.hostel_block, item.room_type].join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  };

 const handleExport = () => {
 const csvContent = convertToCSV(allotments);

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'allotment_results.csv';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

  // ============ NAYA CODE YAHAN KHATAM ============

  if (loading) {
    return <div className="text-center mt-10 text-slate-500">Loading results...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Allotment Results</h1>
            <p className="text-slate-500 text-sm">{allotments.length} students matched</p>
          </div>

          {/* NAYA BUTTON YAHAN */}
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium 
                       px-4 py-2 rounded-lg transition"
          >
            Export CSV
          </button>
        </div>

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