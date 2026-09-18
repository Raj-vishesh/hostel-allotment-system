import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RoomList from './pages/RoomList';
import PreferenceForm from './pages/PreferenceForm';
import MyAllotment from './pages/MyAllotment';
import AdminDashboard from './pages/AdminDashboard';
import AdminOverview from './pages/AdminOverview';
import AdminRooms from './pages/AdminRooms';
import AddRoom from './pages/AddRoom';
import AdminStudents from './pages/AdminStudents';
import AdminResults from './pages/AdminResults';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Portal (Option 2: Dedicated Sub-URLs) */}
        <Route path="/student-dashboard" element={<StudentDashboard />}>
          <Route index element={<Navigate to="rooms" replace />} />
          <Route path="rooms" element={<RoomList />} />
          <Route path="preferences" element={<PreferenceForm />} />
          <Route path="my-allotment" element={<MyAllotment />} />
        </Route>

        {/* Admin Console (Option 2: Dedicated Sub-URLs) */}
        <Route path="/admin-dashboard" element={<AdminDashboard />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="add-room" element={<AddRoom />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="results" element={<AdminResults />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;