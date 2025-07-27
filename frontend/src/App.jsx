import { Route, Routes } from "react-router";

import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import NewTrip from "@/pages/NewTrip";
import TripDetail from "@/pages/TripDetail";
import Trips from "@/pages/Trips";

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route element={<Layout />}>
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/new" element={<NewTrip />} />
        <Route path="/trips/:id" element={<TripDetail />} />
      </Route>
    </Routes>
  );
}
