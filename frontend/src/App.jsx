import { Route, Routes } from "react-router";

import Layout from "@/components/Layout";
import Home from "@/pages/Home.jsx";
import Trips from "@/pages/Trips";

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route element={<Layout />}>
        <Route path="/trips" element={<Trips />} />
      </Route>
    </Routes>
  );
}
