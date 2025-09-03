import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Auth/Login';
import Layout from './components/Layout/Layout';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UserManagement from './pages/Management/UserManagement';
import CreateUser from './pages/Management/CreateUser';
import ScheduleManagement from './pages/Management/ScheduleManagement';
import RoomManagement from './pages/Management/RoomManagement';
import RoomDetail from './pages/Management/RoomDetail';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Admin Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/users/create" element={<CreateUser />} />
          <Route path="/schedule" element={<ScheduleManagement />} />
          <Route path="/schedules" element={<ScheduleManagement />} />
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/rooms/available" element={<RoomManagement />} />
          <Route path="/rooms/in-use" element={<RoomManagement />} />
          <Route path="/rooms/maintenance" element={<RoomManagement />} />
          <Route path="/rooms/requests" element={<RoomManagement />} />
          <Route path="/rooms/statistics" element={<RoomManagement />} />
          <Route path="/rooms/:roomId" element={<RoomDetail />} />
          
          {/* Teacher Routes */}
          <Route path="/room-requests" element={<RoomManagement />} />
          
          {/* Student Routes */}
          <Route path="/profile" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
};

export default App;
