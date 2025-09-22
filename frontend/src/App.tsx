import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './redux/store';
import Login from './pages/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import UserManagement from './pages/Management/UserManagement';
import CreateUser from './pages/Management/CreateUser';
import RoomList from './pages/RoomManagement/RoomList';
import RoomRequest from './pages/RoomManagement/RoomRequest';
import RoomRequestForm from './pages/RoomManagement/RoomRequestForm';
import RoomRequestList from './pages/RoomManagement/RoomRequestList';
import RoomScheduling from './pages/RoomManagement/RoomScheduling';
import ProcessRequest from './pages/RoomManagement/ProcessRequest';
import WeeklySchedule from './pages/Schedule/WeeklySchedule';
import ScheduleManagement from './pages/Schedule/ScheduleManagement';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* @ts-ignore */}
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            // @ts-ignore
            <ProtectedRoute>
              {/* @ts-ignore */}
              <Layout />
            </ProtectedRoute>
          }>
            {/* Admin Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* @ts-ignore */}
            <Route path="/dashboard" element={<Dashboard />} />
            {/* @ts-ignore */}
            <Route path="/users" element={<UserManagement />} />
            {/* @ts-ignore */}
            <Route path="/users/create" element={<CreateUser />} />
            {/* @ts-ignore */}
            <Route path="/rooms" element={<RoomList />} />
            {/* @ts-ignore */}
            <Route path="/rooms/requests" element={<RoomRequest />} />
            {/* @ts-ignore */}
            <Route path="/room-requests" element={<RoomRequestForm />} />
            {/* @ts-ignore */}
            <Route path="/rooms/requests/list" element={<RoomRequestList />} />
            {/* @ts-ignore */}
            <Route path="/rooms/requests/:requestId/process" element={<ProcessRequest />} />
            {/* @ts-ignore */}
            <Route path="/rooms/scheduling" element={<RoomScheduling />} />
            {/* @ts-ignore */}
            <Route path="/schedule/weekly" element={<WeeklySchedule />} />
            {/* @ts-ignore */}
            <Route path="/schedule/management" element={<ScheduleManagement />} />
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
    </Provider>
  );
};

export default App;
