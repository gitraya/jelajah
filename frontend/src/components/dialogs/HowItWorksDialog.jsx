import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function HowItWorksDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          How it works
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How it works</DialogTitle>
          <DialogDescription>
            Connect with fellow travelers and explore amazing trips together.
            Browse public trips, join open adventures, or plan your own journey.
            Share experiences, itineraries, and tips to make every trip
            unforgettable.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
