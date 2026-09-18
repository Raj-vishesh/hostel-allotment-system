import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PreferenceForm() {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch(`${API}/api/preferences/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const sorted = (data.preferences || []).sort((a, b) => a.rank_order - b.rank_order);
          setPreferences(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [API, token]);

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...preferences];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setPreferences(updated);
  };

  const moveDown = (index) => {
    if (index === preferences.length - 1) return;
    const updated = [...preferences];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setPreferences(updated);
  };

  const removePreference = (roomId) => {
    setPreferences(preferences.filter((p) => p.room_id !== roomId));
  };

  const savePreferences = async () => {
    setSaveMsg('');
    setSaving(true);
    try {
      const body = {
        preferences: preferences.map((p, index) => ({
          room_id: p.room_id,
          rank_order: index + 1,
        })),
      };
      const response = await fetch(`${API}/api/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        setSaveSuccess(true);
        setSaveMsg('Preferences submitted successfully! Your choices are saved for Gale-Shapley matching.');
      } else {
        setSaveSuccess(false);
        setSaveMsg(data.message || 'Failed to save preferences');
      }
    } catch (err) {
      setSaveSuccess(false);
      setSaveMsg('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-base font-medium">Loading your preference list...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Ranked List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Your Ranked Room Choices</h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Ordered highest to lowest. Rank #1 will be prioritized by the Gale-Shapley matching algorithm.
            </p>
          </div>
          <span className="text-sm font-bold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700">
            {preferences.length} Selected
          </span>
        </div>

        {preferences.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-slate-800">No rooms ranked yet</h3>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-md mx-auto mb-6">
              Head over to Browse Rooms to explore RNT Hostel rooms across Blocks A to E and select your preferred choices.
            </p>
            <button
              type="button"
              onClick={() => navigate('/student-dashboard/rooms')}
              className="px-6 py-3 rounded-xl bg-[#00695c] text-white text-sm sm:text-base font-bold hover:bg-[#00574b] transition shadow-xs"
            >
              Browse RNT Rooms →
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {preferences.map((room, index) => (
              <div
                key={room.room_id || room.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {/* Priority Rank Circle */}
                  <div className="w-11 h-11 rounded-xl bg-[#004d40] text-emerald-200 flex items-center justify-center font-black text-base shadow-xs">
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-extrabold text-slate-900 text-lg">
                        Room {room.room_number}
                      </h4>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {room.hostel_block}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Floor {room.floor ?? '—'} · {room.room_type || 'Single'} Occupancy ({room.capacity ?? 1} Bed)
                    </p>
                  </div>
                </div>

                {/* Move Up, Move Down, Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition"
                    title="Move up in priority"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === preferences.length - 1}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition"
                    title="Move down in priority"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => removePreference(room.room_id || room.id)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1"
                    title="Remove from list"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Submission Card */}
      <div className="space-y-5">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Submit Your Preference List</h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">
            NIT Agartala uses the <strong>Gale-Shapley stable matching algorithm</strong>.
            Allotment is strictly based on your ranked order and available room quotas — not first-come-first-served.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-sm sm:text-base space-y-2 text-slate-700 mb-6">
            <div className="flex justify-between">
              <span>Total Rooms Ranked:</span>
              <span className="font-extrabold text-slate-900">{preferences.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Top Pick (Rank #1):</span>
              <span className="font-extrabold text-emerald-800">
                {preferences[0] ? `Room ${preferences[0].room_number}` : 'None'}
              </span>
            </div>
          </div>

          {saveMsg && (
            <div
              className={`text-sm p-4 rounded-xl mb-5 border leading-relaxed flex items-start gap-2.5 ${
                saveSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                  : 'bg-rose-50 border-rose-300 text-rose-700 font-medium'
              }`}
            >
              <span>{saveSuccess ? '✓' : '⚠️'}</span>
              <span>{saveMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={savePreferences}
            disabled={saving || preferences.length === 0}
            className="w-full bg-[#00695c] hover:bg-[#00574b] active:bg-[#004d40] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-950/10 transition flex items-center justify-center gap-2 text-base"
          >
            {saving ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <span>Save &amp; Confirm Preferences</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 text-sm sm:text-base text-emerald-900">
          <p className="font-bold mb-1.5 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Can I change my preferences later?</span>
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Yes! You can re-order, add, or remove rooms anytime before the official allotment cycle is executed by the Chief Warden.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PreferenceForm;