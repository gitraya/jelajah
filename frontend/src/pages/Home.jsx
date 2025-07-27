import { Link } from "react-router";

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
        <Link
          to="/trips"
          className="px-6 py-3 bg-blue-600 text-white! rounded-xl shadow hover:bg-blue-700 transition"
        >
          Jelajahi Trip
        </Link>
        <Link
          to="/trips/new"
          className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition"
        >
          Buat Trip Baru
        </Link>
      </div>
    </main>
  );
}
