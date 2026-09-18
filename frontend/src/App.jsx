import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RoomList from './pages/RoomList';
import AddRoom from './pages/AddRoom';
import AdminResults from './pages/AdminResults';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        <Route path="/student-dashboard/*" element={<StudentDashboard />} />

        <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;