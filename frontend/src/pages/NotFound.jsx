import { FrownIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] sm:h-[calc(100vh-129px)]">
        <FrownIcon className="w-16 h-16 mb-1 text-blue-800" />
        <h1 className="text-3xl font-semibold text-blue-800">Page Not Found</h1>
        <p className="text-muted-foreground">
          Sorry, the page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
