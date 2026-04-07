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
import UserProfile from "../features/auth/UserProfile";
import Settings from "../features/auth/Settings";
import { Communication } from "../features/communication/Communication";
import { Leaders } from "../features/leaders/Leaders";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          {/* Dashboard is accessible to all logged in users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/prayer" element={<PrayerRequests />} />
            <Route path="/profile" element={<UserProfile />} />{" "}
            <Route path="/settings" element={<Settings />} />{" "}
            <Route
              path="/members/:memberId/profile"
              element={<MemberProfilePage />}
            />
          </Route>

          {/* Leaders/Admin only routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["Admin", "Leader"]} />}
          >
            <Route path="/communication" element={<Communication />} />
            <Route path="/leaders" element={<Leaders />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
