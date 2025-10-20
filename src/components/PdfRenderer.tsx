"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";

interface PDFRendererProps {
  url: string;
}

const PDFRenderer = ({ url }: PDFRendererProps) => {
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("1");
  const [prevPage, setPrevPage] = useState<number>(1);

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const HandlePageJump = () => {
    const inputPage = parseInt(inputValue, 10);
    if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= numPages) {
      jumpToPage(inputPage - 1);
    } else {
      setInputValue(prevPage.toString());
    }
  };

  // Base width of a PDF page — used to calculate scale ratio
  const baseWidth = 684;

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* Toolbar */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            aria-label="previous page"
            variant="ghost"
            onClick={() => {
              const inputPage = parseInt(inputValue, 10);
              if (inputPage <= numPages - 1) {
                setInputValue((inputPage + 1).toString());
                jumpToPage(inputPage);
              }
            }}
          >
            <ChevronDown className="h-4 w-4"></ChevronDown>
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              className="w-12 h-8"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  HandlePageJump();
                }
              }}
            ></Input>
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            aria-label="next page"
            variant="ghost"
            onClick={() => {
              const inputPage = parseInt(inputValue, 10);
              if (inputPage >= 2) {
                setInputValue((inputPage - 1).toString());
                jumpToPage(inputPage - 2);
              }
            }}
          >
            <ChevronUp className="h-4 w-4"></ChevronUp>
          </Button>
        </div>
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
                onDocumentLoad={(e) => {
                  // e.doc contains info about the document
                  setNumPages(e.doc.numPages);
                }}
                plugins={[pageNavigationPluginInstance]}
                onPageChange={(e) => {
                  setPrevPage(e.currentPage + 1);
                  setInputValue((e.currentPage + 1).toString());
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
