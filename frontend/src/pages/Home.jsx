import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-100 px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-blue-800">
        Jelajah
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-8">
        Rencanakan liburan bareng teman atau keluarga. Kolaborasi, diskusi, dan
        sharing semua destinasi dalam satu tempat.
      </p>

      <div className="flex gap-4">
        <Link to="/trips">
          <Button size="lg">Jelajahi Trip</Button>
        </Link>
        <Link to="/trips/new">
          <Button size="lg">Buat Trip Baru</Button>
        </Link>
      </div>
    </main>
  );
}
