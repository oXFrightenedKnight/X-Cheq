"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";

interface PDFRendererProps {
  url: string;
}

const PDFRenderer = ({ url }: PDFRendererProps) => {
  const { width, ref } = useResizeDetector();

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">Toolbar</div>
      </div>{" "}
      {/* toolbar of pdf */}
      <div className="w-full h-[80vh]">
        <div className="h-full overflow-auto" ref={ref}>
          <div style={{ width: width ? `${width}px` : "100%" }} className="">
            <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js">
              <Viewer
                fileUrl={url}
                renderLoader={() => (
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin"></Loader2>
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
              ></Viewer>
            </Worker>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFRenderer;
