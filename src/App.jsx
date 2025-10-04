import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
// Admin
import AdminLogin from "./Pages/Admin/AdminLogin/AdminLogin";
import AdminSocks from "./Pages/Admin/AdminSetting/Socks/Socks";
import AdminLocation from "./Pages/Admin/AdminSetting/Location/Location";
import AdminCarers from "./Pages/Admin/AdminSetting/Carers/Carers";
// Carer
import CareLogin from "./Pages/Care/CareLogin/CareLogin";
import Overview from "./Pages/Care/Overview/Overview";
import OverviewProfile from "./Pages/Care/OverviewProfile/OverviewProfile";
import WearerAlearts from "./Pages/Care/OverviewProfile/Pages/WearerAlearts";
import WearerObservations from "./Pages/Care/OverviewProfile/Pages/WearerObservations";
import DrillDown from "./Pages/Care/DrillDown/DrillDown";
import Compare from "./Pages/Care/Compare/Compare";
import Aleart from "./Pages/Care/Aleart/Aleart";
import ReportPreview from "./Pages/Care/ReportPreview/ReportPreview";
import CalmnessOverview from "./Pages/Care/DrillDown/Pages/CalmnessOverview";
import MobilityOverview from "./Pages/Care/DrillDown/Pages/MobilityOverview";
import ActivityOverview from "./Pages/Care/DrillDown/Pages/ActivityOverview";
import Notification from "./Pages/Care/Notification/Notification";
import Socks from "./Pages/Care/Settings/Pages/Socks/Socks";
import CareSetting from "./Pages/Care/Settings/Pages/CareSetting/CareSetting";
import Weares from "./Pages/Care/Settings/Pages/Weares/Weares";
import NotSupport from "./Pages/NotSupport/NotSupport";
export default function App() {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 850);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 850);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Simple mobile detection
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      navigate("/not-support");
    }
  }, [navigate]);

  if (isSmallScreen) {
    return (
      <Routes>
        <Route path="*" element={<NotSupport />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/socks" element={<AdminSocks />} />
      <Route path="/admin/location" element={<AdminLocation />} />
      <Route path="/admin/carers" element={<AdminCarers />} />
      {/* Carer */}
      <Route path="/" element={<CareLogin />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/overviewProfile" element={<OverviewProfile />} />
      <Route path="/wearerAlearts" element={<WearerAlearts />} />
      <Route path="/wearerObservations" element={<WearerObservations />} />
      <Route path="/drillDown" element={<DrillDown />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/alert" element={<Aleart />} />
      <Route path="/reportPreview" element={<ReportPreview />} />
      <Route path="/calmnessOverview" element={<CalmnessOverview />} />
      <Route path="/mobilityOverview" element={<MobilityOverview />} />
      <Route path="/activityOverview" element={<ActivityOverview />} />
      <Route path="/notification" element={<Notification />} />
      <Route path="/socks" element={<Socks />} />
      <Route path="/careSetting" element={<CareSetting />} />
      <Route path="/weares" element={<Weares />} />
      {/* Others */}
      <Route path="/not-support" element={<NotSupport />} />
    </Routes>
  );
}
