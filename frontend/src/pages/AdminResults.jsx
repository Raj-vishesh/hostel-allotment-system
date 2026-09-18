import { useState, useEffect } from 'react';

function AdminResults() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/allotments/admin-students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
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

  const handleRunAllotment = async () => {
    setMatching(true);
    setMessage('');
    try {
      const response = await fetch(`${API}/api/match/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        setMessage(`Matching executed successfully: ${data.matchedCount} students matched, ${data.unmatchedCount} unmatched.`);
        await fetchData();
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Matching failed');
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage('Server error during matching execution.');
    } finally {
      setMatching(false);
    }
  };

  const handleResetAllotment = async () => {
    if (!window.confirm('Are you sure you want to reset all room allotments?')) return;
    setResetting(true);
    setMessage('');
    try {
      const response = await fetch(`${API}/api/match/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        setMessage('Allotments reset successfully. All students are now unallotted.');
        await fetchData();
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Reset failed');
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage('Server error during reset.');
    } finally {
      setResetting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Branch', 'Year', 'Allotted Room', 'Hostel Block', 'Preferences Count'];
    const rows = students.map((s) => [
      `"${s.name || ''}"`,
      `"${s.roll_number || ''}"`,
      `"${s.branch || ''}"`,
      `"${s.year || ''}"`,
      `"${s.allotted_room_number || 'Unallotted'}"`,
      `"${s.allotted_block || ''}"`,
      s.preferences ? s.preferences.length : 0,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NIT_Agartala_Allotment_Results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const allottedCount = students.filter((s) => s.allotted_room_number).length;

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-base font-medium">Loading allotment results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gale-Shapley Allotment Engine
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Run stable matching for NIT Agartala RNT Hostel applicants
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetAllotment}
            disabled={resetting || allottedCount === 0}
            className="px-5 py-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 border border-rose-200 text-sm sm:text-base font-bold transition flex items-center gap-2"
          >
            {resetting ? 'Resetting...' : '↺ Reset Allotments'}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm sm:text-base font-bold shadow-xs transition flex items-center gap-2"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleRunAllotment}
            disabled={matching}
            className="px-6 py-3 rounded-xl bg-[#00695c] hover:bg-[#00574b] active:bg-[#004d40] disabled:opacity-60 text-white text-sm sm:text-base font-bold shadow-md transition flex items-center gap-2"
          >
            {matching ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Matching...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Run Allotment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Match Banner Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-sm sm:text-base font-bold flex items-center gap-3 ${
            isSuccess
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <span className="text-xl">{isSuccess ? '✓' : '⚠️'}</span>
          <span>{message}</span>
        </div>
      )}

      {/* Matching Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-xs sm:text-sm uppercase font-bold tracking-wider text-slate-600">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Roll Number</th>
                <th className="py-4 px-6">Branch &amp; Year</th>
                <th className="py-4 px-6">Allotted Room</th>
                <th className="py-4 px-6">Hostel Block</th>
                <th className="py-4 px-6">Floor</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm sm:text-base font-medium text-slate-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                    No registered students available for allotment.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const isAllotted = Boolean(s.allotted_room_number);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4.5 px-6 font-black text-slate-900">
                        {s.name}
                      </td>
                      <td className="py-4.5 px-6 font-semibold text-slate-700">
                        {s.roll_number || '—'}
                      </td>
                      <td className="py-4.5 px-6 text-slate-600">
                        {s.branch || 'B.Tech'} (Year {s.year || 1})
                      </td>
                      <td className="py-4.5 px-6">
                        {isAllotted ? (
                          <span className="font-black text-[#00695c] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-sm sm:text-base">
                            Room {s.allotted_room_number}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unallotted</span>
                        )}
                      </td>
                      <td className="py-4.5 px-6 font-semibold text-slate-700">
                        {s.allotted_block || '—'}
                      </td>
                      <td className="py-4.5 px-6 text-slate-700">
                        {s.allotted_floor ? `Floor ${s.allotted_floor}` : '—'}
                      </td>
                      <td className="py-4.5 px-6">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                            isAllotted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isAllotted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {isAllotted ? 'Allotted' : 'Pending'}
                        </span>
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

export default AdminResults;