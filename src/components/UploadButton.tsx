"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { DialogContent, Dialog, DialogTrigger, DialogTitle } from "./ui/dialog";

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF File</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Hi!</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
