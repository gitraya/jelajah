import { Outlet } from "react-router";

import Navbar from "@/components/Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-screen flex justify-center">
        <Outlet />
      </main>
    </>
  );
}
