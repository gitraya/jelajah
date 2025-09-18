import { Route, Routes } from "react-router";

import Layout from "@/components/layouts/Layout";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Home from "@/pages/Home";
import MyTrips from "@/pages/MyTrips";
import NewTrip from "@/pages/NewTrip";
import NotFound from "@/pages/NotFound";
import TripDetail from "@/pages/TripDetail";
import TripEdit from "@/pages/TripEdit";
import Trips from "@/pages/Trips";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<Home />} />
        <Route>
          <Route path="/trips/my" element={<MyTrips />} />
          <Route path="/trips/new" element={<NewTrip />} />
          <Route path="/trips/:id/my" element={<TripDetail />} />
          <Route path="/trips/:id/edit" element={<TripEdit />} />
        </Route>
        <Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/:id" element={<TripDetail />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
