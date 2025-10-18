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

  // Base width of a PDF page — used to calculate scale ratio
  const baseWidth = 684;

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* Toolbar */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">Toolbar</div>
      </div>

      {/* PDF viewer */}
      <div className="w-full h-[80vh]" ref={ref}>
        <div className="h-full overflow-auto">
          {width ? (
            <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js">
              <Viewer
                fileUrl={url}
                key={width}
                defaultScale={width / baseWidth} // Dynamically scale to container width
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
              />
            </Worker>
          ) : (
            <div className="flex justify-center">
              <Loader2 className="my-24 h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFRenderer;
