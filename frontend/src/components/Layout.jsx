import { Outlet } from "react-router";

import Navbar from "@/components/Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen w-screen bg-accent">
      <Navbar />
      <main className="flex justify-center">
        <Outlet />
      </main>
    </div>
  );
}
