import { FrownIcon } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container py-8 px-4">
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] sm:h-[calc(100vh-129px)]">
          <FrownIcon className="w-16 h-16 mb-1 text-primary" />
          <h1 className="text-3xl font-semibold text-primary">
            Page Not Found
          </h1>
          <p className="text-muted-foreground">
            Sorry, the page you are looking for does not exist.
          </p>
          <Link
            to="/"
            className={buttonVariants({
              variant: "outline",
              className: "mt-4",
            })}
          >
            Go back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
