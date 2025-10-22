"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ExpandIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useResizeDetector } from "react-resize-detector";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import { rotatePlugin } from "@react-pdf-viewer/rotate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Pdffulsscreenprops {
  fileUrl: string;
  currentPage: number;
}

const PDFFullScreen = ({ fileUrl, currentPage }: Pdffulsscreenprops) => {
  const [isOpen, setIsOpen] = useState(false);
  const { width, ref } = useResizeDetector();

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const rotatePluginInstance = rotatePlugin();
  const { Rotate } = rotatePluginInstance;

  const baseWidth = 500;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="gap-1.5"
          aria-label="fullscreen"
          onClick={() => setIsOpen(true)}
        >
          <ExpandIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("sm:max-w-[95vw] w-full")}>
        <DialogTitle aria-describedby="full screen pdf">
          <div className="w-full h-[90vh]" ref={ref}>
            <div className="h-full overflow-auto">
              <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js">
                <Viewer
                  fileUrl={fileUrl}
                  key={width}
                  defaultScale={(width ?? baseWidth) / baseWidth}
                  renderLoader={() => (
                    <div className="flex justify-center">
                      <Loader2 className="my-24 h-6 w-6 animate-spin" />
                    </div>
                  )}
                  renderError={(error) => {
                    toast.error("Unable to load PDF file.");
                    return (
                      <div className="flex items-center justify-center h-[80vh] text-zinc-500">
                        <p>Failed to load PDF.</p>
                      </div>
                    );
                  }}
                  onDocumentLoad={() => {
                    jumpToPage(currentPage - 1);
                  }}
                  plugins={[pageNavigationPluginInstance, rotatePluginInstance]}
                />
              </Worker>
            </div>
          </div>
        </DialogTitle>
      </DialogContent>
    </Dialog>
  );
};

export default PDFFullScreen;
