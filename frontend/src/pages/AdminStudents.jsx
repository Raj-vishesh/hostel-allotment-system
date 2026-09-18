import { useState, useEffect } from 'react';

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
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

    fetchStudents();
  }, [API, token]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-base font-medium">Loading registered students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Registered Students &amp; Preferences
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            View registered students, their ranked room choices, and allotment status
          </p>
        </div>

        <span className="text-sm font-bold px-4 py-2 rounded-full bg-slate-100 text-slate-700 w-fit">
          Total: {students.length} Students
        </span>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="text-5xl mb-3">👥</div>
          <h3 className="text-xl font-bold text-slate-800">No students registered yet</h3>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Students will show up here once they create an account and submit preferences.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student) => {
            const isAllotted = Boolean(student.allotted_room_number);

            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                {/* Top row: Avatar, Name, Program, Allotment status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#004d40] text-emerald-200 flex items-center justify-center font-black text-lg shadow-xs">
                      {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                          {student.name}
                        </h3>
                        <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {student.roll_number || 'Roll Pending'}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-medium text-slate-600 mt-1">
                        {student.branch || 'B.Tech'} · Year {student.year || '1'} · {student.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isAllotted ? (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-bold">
                        ✓ Allotted: Room {student.allotted_room_number} ({student.allotted_block})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs sm:text-sm font-bold">
                        ⏳ Unallotted
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom row: Preferences pills in order */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Preferences Submitted (in rank order):
                  </p>
                  {student.preferences && student.preferences.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {student.preferences.map((pref, idx) => {
                        const isThisAllotted =
                          isAllotted && student.allotted_room_number === pref.room_number;

                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border ${
                              isThisAllotted
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="opacity-60">#{idx + 1}</span>
                            <span>Room {pref.room_number}</span>
                            <span className="text-slate-400">({pref.hostel_block})</span>
                            {isThisAllotted && <span className="text-emerald-700 font-black">✓</span>}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 italic">
                      No room preferences ranked yet.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminStudents;
