import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import { Members } from "../features/members/Members";
import { Programs } from "../features/programmes/Programs";
import { Attendance } from "../features/attendance/Attendance";
import { Dashboard } from "../features/dashboard/Dashboard";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/program" element={<Programs />} />
          <Route path="/attendance" element={<Attendance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
