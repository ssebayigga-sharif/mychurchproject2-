import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Members } from "../features/members/Members";
import { Programs } from "../features/programmes/Programs";
import { Attendance } from "../features/attendance/Attendance";
import { Dashboard } from "../features/dashboard/Dashboard";
import { MemberProfilePage } from "../features/members/MemberProfilePage";
import { PrayerRequests } from "../features/prayers/PrayerRequests";
import { Login } from "../features/auth/Login";


export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          {/* Public Home Page */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Protected App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/members" element={<Members />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/attendance" element={<Attendance />} />
            
            <Route
              path="/members/:memberId/profile"
              element={<MemberProfilePage />}
            />
            <Route path="/prayer" element={<PrayerRequests />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
