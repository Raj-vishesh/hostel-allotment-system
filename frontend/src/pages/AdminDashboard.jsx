import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function AdminDashboard() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default AdminDashboard;