import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [role, setRole] = useState('student'); // 'student' | 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Sign in fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('B.Tech Computer Science');
  const [year, setYear] = useState('1');
  const [gender, setGender] = useState('Male');
  const [regPassword, setRegPassword] = useState('');

  const isStudent = role === 'student';

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid credentials');
        return;
      }

      if (data.user.role !== role) {
        setError(`This account is registered as a ${data.user.role}, not an ${role}. Please switch roles above.`);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('name', data.user.name);
      navigate(data.user.role === 'admin' ? '/admin-dashboard/rooms' : '/student-dashboard/rooms');
    } catch (err) {
      setError('Cannot connect to server. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const payload = {
        name,
        email: regEmail,
        password: regPassword,
        role,
        ...(isStudent && {
          roll_number: rollNumber,
          branch,
          year: parseInt(year, 10) || 1,
          gender,
        }),
      };

      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      // Pre-fill sign in form and switch to sign in
      setEmail(regEmail);
      setPassword('');
      setMode('signin');
      setError('');
    } catch (err) {
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] text-slate-800">
      {/* Left hero panel */}
      <div className="lg:w-1/2 relative min-h-[420px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden bg-[#004d40]">
        {/* Background campus visual & gradients */}
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#00382e] via-[#004d40]/95 to-[#005b4c]/90 pointer-events-none" />

        {/* Top University Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#00695c] border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-950/30">
            <svg className="w-6 h-6 text-emerald-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white m-0 leading-tight">NIT Agartala</h2>
            <p className="text-xs text-emerald-200/90 font-medium m-0">Hostel Allotment Portal</p>
          </div>
        </div>

        {/* Center Headline & Mission */}
        <div className="relative z-10 my-12 lg:my-0 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1 rounded-full text-xs font-medium text-emerald-100 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Academic Year 2026 – 27
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
            Your home on campus, allotted fairly.
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Register, explore residence halls across our four blocks, and rank your preferred rooms.
            Allotment is decided on a transparent, preference-based Gale-Shapley matching algorithm.
          </p>
        </div>

        {/* Bottom Key Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-emerald-500/20 text-emerald-100">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white m-0">4</p>
            <p className="text-xs sm:text-sm text-emerald-200/80 m-0">Residence blocks</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white m-0">320+</p>
            <p className="text-xs sm:text-sm text-emerald-200/80 m-0">Rooms managed</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white m-0">100%</p>
            <p className="text-xs sm:text-sm text-emerald-200/80 m-0">Transparent process</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 py-10 lg:py-16">
        <div className="w-full max-w-[460px]">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight m-0 mb-1.5">
              {mode === 'signin' ? 'Sign in to the portal' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-500 m-0">
              Choose your role to continue to hostel allotment.
            </p>
          </div>

          {/* Role selector segmented control */}
          <div className="flex bg-[#e8f5e9] p-1.5 rounded-2xl mb-6 border border-emerald-100">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setError('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all ${
                isStudent
                  ? 'bg-white text-emerald-950 shadow-sm shadow-emerald-900/10'
                  : 'text-emerald-800/70 hover:text-emerald-950'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
              </svg>
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setError('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all ${
                !isStudent
                  ? 'bg-white text-emerald-950 shadow-sm shadow-emerald-900/10'
                  : 'text-emerald-800/70 hover:text-emerald-950'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Administrator
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/70">
            {/* Mode switch tabs: Sign in / Register */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    {isStudent ? 'University email' : 'Staff email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isStudent ? 'student@nita.ac.in' : 'warden@nita.ac.in'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#00695c] hover:bg-[#00574b] active:bg-[#004d40] disabled:opacity-60 text-white font-medium py-3 rounded-xl shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading
                    ? 'Signing in...'
                    : isStudent
                    ? 'Sign in →'
                    : 'Sign in to admin console →'}
                </button>
              </form>
            ) : (
              /* REGISTER FORM (Matches Screenshot 4) */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Nair"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                  />
                </div>

                {/* 2-column email and roll number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@nita.ac.in"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                    />
                  </div>

                  {isStudent && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                        Roll number
                      </label>
                      <input
                        type="text"
                        required
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="2026CS0001"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                      />
                    </div>
                  )}
                </div>

                {/* Student specific fields: Program, Year, Gender */}
                {isStudent && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                        Program
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                      >
                        <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                        <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                        <option value="B.Tech Electronics & Communication">B.Tech Electronics &amp; Communication</option>
                        <option value="B.Tech Electrical Engineering">B.Tech Electrical Engineering</option>
                        <option value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</option>
                        <option value="B.Tech Civil Engineering">B.Tech Civil Engineering</option>
                        <option value="MBA">MBA</option>
                        <option value="M.Tech">M.Tech</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                          Year of study
                        </label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                        >
                          <option value="1">1st year</option>
                          <option value="2">2nd year</option>
                          <option value="3">3rd year</option>
                          <option value="4">4th year</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#00695c] hover:bg-[#00574b] active:bg-[#004d40] disabled:opacity-60 text-white font-medium py-3 rounded-xl shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading
                    ? 'Creating account...'
                    : isStudent
                    ? 'Create account & continue →'
                    : 'Create admin account →'}
                </button>
              </form>
            )}
          </div>

          {/* Footer contact help */}
          <p className="text-center text-xs text-slate-500 mt-6 m-0">
            Need help? Contact the NIT Agartala Hostel Office at{' '}
            <a href="mailto:hostel@nita.ac.in" className="text-[#00695c] font-medium hover:underline">
              hostel@nita.ac.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
