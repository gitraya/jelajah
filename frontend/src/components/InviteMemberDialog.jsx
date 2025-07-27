import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function InviteMemberDialog({ onInvite }) {
  const [email, setEmail] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-white hover:text-white">
          Undang Teman
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Undang Teman ke Trip Ini</DialogTitle>
        </DialogHeader>
        <Input
          type="email"
          placeholder="Email teman"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={() => onInvite(email)}>Kirim Undangan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
