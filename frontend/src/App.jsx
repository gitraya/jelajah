import { Route, Routes } from "react-router";

import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
    </Routes>
  );
}
