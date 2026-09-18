import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyAllotment() {
  const [allotment, setAllotment] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name') || 'Student';
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allotRes, prefRes] = await Promise.all([
          fetch(`${API}/api/allotments/my`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/preferences/my`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (allotRes.ok) {
          const aData = await allotRes.json();
          setAllotment(aData.allotment);
        }

        if (prefRes.ok) {
          const pData = await prefRes.json();
          setPreferences(pData.preferences || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API, token]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-base font-medium">Loading allotment records...</p>
      </div>
    );
  }

  return (
    <div>
      {allotment ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Official Certificate Card */}
          <div className="bg-white rounded-3xl border-2 border-[#004d40]/20 shadow-xl overflow-hidden p-6 sm:p-10 relative">
            {/* Slip Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#004d40] text-emerald-200 flex items-center justify-center font-black text-2xl shadow-md">
                  NIT
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    National Institute of Technology Agartala
                  </h2>
                  <p className="text-sm text-emerald-800 font-bold tracking-wide uppercase mt-1">
                    Hostel &amp; Estate Management Division · Allotment Slip
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold border border-emerald-300">
                  ✓ Verified &amp; Confirmed
                </span>
                <p className="text-xs font-semibold text-slate-400 mt-1">Academic Session 2026–27</p>
              </div>
            </div>

            {/* Large Allotted Room Callout */}
            <div className="bg-gradient-to-br from-[#004d40] to-[#00695c] rounded-2xl p-6 sm:p-8 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between shadow-lg mb-6">
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest text-emerald-200 font-bold mb-1">
                  Allotted Residence Room
                </p>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight">
                  Room {allotment.room_number}
                </h3>
                <p className="text-emerald-100 text-base sm:text-lg mt-1.5 font-medium">
                  R.N. Tagore (RNT) Hostel · {allotment.hostel_block}
                </p>
              </div>

              <div className="mt-4 sm:mt-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-emerald-400/30 pt-3 sm:pt-0 sm:pl-8">
                <p className="text-sm text-emerald-200 font-semibold">Floor Level</p>
                <p className="text-2xl sm:text-3xl font-black">Floor {allotment.floor || '—'}</p>
                <p className="text-sm text-emerald-200 mt-1 font-semibold">Type: {allotment.room_type || 'Single'}</p>
              </div>
            </div>

            {/* Student & Allotment Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-slate-100 text-sm">
              <div>
                <span className="text-slate-500 uppercase font-bold text-xs block">Student Name</span>
                <span className="font-black text-slate-900 text-base sm:text-lg block mt-1">
                  {allotment.student_name || name}
                </span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-xs block">Roll Number</span>
                <span className="font-black text-slate-900 text-base sm:text-lg block mt-1">
                  {allotment.roll_number || 'Registered'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-xs block">Hostel Block</span>
                <span className="font-black text-slate-900 text-base sm:text-lg block mt-1">
                  {allotment.hostel_block}
                </span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-xs block">Allotted Date</span>
                <span className="font-black text-slate-900 text-base sm:text-lg block mt-1">
                  {allotment.matched_at ? new Date(allotment.matched_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            {/* Moving-In Instructions Checklist */}
            <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
              <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>Next Steps for Room Possession &amp; Move-in:</span>
              </h4>
              <ul className="space-y-3 text-sm sm:text-base text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">1.</span>
                  <span><strong>Key Handover:</strong> Report to the RNT Hostel Warden / Caretaker Office (Ground Floor, Block A) between 9:00 AM – 5:00 PM.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">2.</span>
                  <span><strong>Identification:</strong> Present your NIT Agartala student ID card and a copy of this allotment slip.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">3.</span>
                  <span><strong>Inventory Check:</strong> Inspect the electrical points, study table, and room fixtures and submit the check sheet within 48 hours.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">4.</span>
                  <span><strong>Mess Registration:</strong> Activate your monthly dining subscription at the RNT Hostel Central Mess counter.</span>
                </li>
              </ul>
            </div>

            {/* Print Slip Button */}
            <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm sm:text-base font-bold shadow-md transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Allotment Slip</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Timeline if not yet allotted */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-3xl mx-auto mb-5">
            ⏳
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Room Allotment in Progress</h3>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Your application is active for <strong>RNT Hostel (Blocks A to E)</strong>. The Chief Warden office will run the Gale-Shapley matching algorithm once the preference window closes.
          </p>

          {/* 4-Stage Tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 my-8 text-left">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300">
              <span className="text-xs uppercase font-bold text-emerald-800 block">Step 1</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 block mt-1">Registration</span>
              <span className="text-xs text-emerald-700 font-bold block mt-1">✓ Complete</span>
            </div>
            <div className={`p-3.5 rounded-2xl border ${preferences.length > 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs uppercase font-bold text-slate-500 block">Step 2</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 block mt-1">Preferences</span>
              <span className={`text-xs block mt-1 font-bold ${preferences.length > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                {preferences.length > 0 ? `✓ ${preferences.length} Ranked` : 'Pending'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300">
              <span className="text-xs uppercase font-bold text-amber-800 block">Step 3</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 block mt-1">Gale-Shapley</span>
              <span className="text-xs text-amber-700 block mt-1 font-bold">⏳ In Progress</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 opacity-60">
              <span className="text-xs uppercase font-bold text-slate-400 block">Step 4</span>
              <span className="text-sm sm:text-base font-bold text-slate-700 block mt-1">Room Allotment</span>
              <span className="text-xs text-slate-400 block mt-1">Upcoming</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/student-dashboard/preferences')}
            className="px-6 py-3 rounded-xl bg-[#00695c] hover:bg-[#00574b] text-white text-sm sm:text-base font-bold shadow-xs transition"
          >
            Review or Update Room Preferences →
          </button>
        </div>
      )}
    </div>
  );
}

export default MyAllotment;