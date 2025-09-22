import { Route, Routes } from "react-router";

import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Home from "@/pages/Home";
import MyTrips from "@/pages/MyTrips";
import NotFound from "@/pages/NotFound";
import TripDetail from "@/pages/TripDetail";
import TripManage from "@/pages/TripManage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<Home />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/trips/my" element={<MyTrips />} />
          <Route path="/trips/:id/manage" element={<TripManage />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/trips/:id" element={<TripDetail />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
