import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import Home from "@/pages/Home";
import Access from "@/pages/Access";
import TempAccess from "@/pages/Access/TempAccess";
import Visitor from "@/pages/Visitor";
import VisitorReserve from "@/pages/Visitor/Reserve";
import Meeting from "@/pages/Meeting";
import MeetingDetail from "@/pages/Meeting/Detail";
import MyBookings from "@/pages/Meeting/MyBookings";
import Repair from "@/pages/Repair";
import RepairSubmit from "@/pages/Repair/Submit";
import ComfortFeedback from "@/pages/Repair/Comfort";
import Parking from "@/pages/Parking";
import ParkingPay from "@/pages/Parking/Pay";
import Profile from "@/pages/Profile";
import Satisfaction from "@/pages/Profile/Satisfaction";
import Messages from "@/pages/Profile/Messages";
import Evacuation from "@/pages/Home/Evacuation";
import IndoorNav from "@/pages/Home/IndoorNav";

export default function App() {
  return (
    <Router>
      <div className="app-container min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home/evacuation" element={<Evacuation />} />
          <Route path="/home/navigation" element={<IndoorNav />} />

          <Route path="/access" element={<Access />} />
          <Route path="/access/temp" element={<TempAccess />} />

          <Route path="/visitor" element={<Visitor />} />
          <Route path="/visitor/reserve" element={<VisitorReserve />} />

          <Route path="/meeting" element={<Meeting />} />
          <Route path="/meeting/:id" element={<MeetingDetail />} />
          <Route path="/meeting/my" element={<MyBookings />} />

          <Route path="/repair" element={<Repair />} />
          <Route path="/repair/submit" element={<RepairSubmit />} />
          <Route path="/repair/comfort" element={<ComfortFeedback />} />

          <Route path="/parking" element={<Parking />} />
          <Route path="/parking/pay" element={<ParkingPay />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/satisfaction" element={<Satisfaction />} />
          <Route path="/profile/messages" element={<Messages />} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
