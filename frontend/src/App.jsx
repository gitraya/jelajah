import { Route, Routes } from "react-router";

import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import MyTrips from "@/pages/MyTrips";
import NewTrip from "@/pages/NewTrip";
import NotFound from "@/pages/NotFound";
import TripDetail from "@/pages/TripDetail";
import TripEdit from "@/pages/TripEdit";
import Trips from "@/pages/Trips";

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route element={<Layout />}>
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/my" element={<MyTrips />} />
        <Route path="/trips/new" element={<NewTrip />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route path="/trips/:id/edit" element={<TripEdit />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
