"use client";

import { RotateDirection, Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import { rotatePlugin, RenderRotateProps } from "@react-pdf-viewer/rotate";
import { CheckIcon, ChevronDown, ChevronUp, Loader2, RotateCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import PDFFullScreen from "./PDFFullScreen";

interface PDFRendererProps {
  url: string;
}

const PDFRenderer = ({ url }: PDFRendererProps) => {
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("1");
  const [prevPage, setPrevPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(0);
  const [autoFit, setAutoFit] = useState<boolean>(true);

  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const rotatePluginInstance = rotatePlugin();
  const { Rotate } = rotatePluginInstance;

  const HandlePageJump = () => {
    const inputPage = parseInt(inputValue, 10);
    if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= numPages) {
      jumpToPage(inputPage - 1);
    } else {
      setInputValue(prevPage.toString());
    }
  };
  const HandleZoom = (scaleTo: number) => {
    setScale(scaleTo);
    zoomTo(scaleTo);
    setAutoFit(false);
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

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4"></Search>
                {autoFit ? <div>Auto</div> : <div>{scale * 100}%</div>}
                <ChevronDown className="h-3 w-3 opacity-50"></ChevronDown>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  setAutoFit(true);
                  setScale(0);
                }}
                className="flex justify-between items-center"
              >
                Auto
                {autoFit ? <CheckIcon></CheckIcon> : null}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  HandleZoom(0.75);
                }}
                className="flex justify-between items-center"
              >
                75%
                {scale === 0.75 ? <CheckIcon></CheckIcon> : null}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  HandleZoom(1);
                }}
                className="flex justify-between items-center"
              >
                100%
                {scale === 1 ? <CheckIcon></CheckIcon> : null}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  HandleZoom(1.25);
                }}
                className="flex justify-between items-center"
              >
                125%
                {scale === 1.25 ? <CheckIcon></CheckIcon> : null}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  HandleZoom(1.5);
                }}
                className="flex justify-between items-center"
              >
                150%
                {scale === 1.5 ? <CheckIcon></CheckIcon> : null}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  HandleZoom(2);
                }}
                className="flex justify-between items-center"
              >
                200%
                {scale === 2 ? <CheckIcon></CheckIcon> : null}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  HandleZoom(3);
                }}
                className="flex justify-between items-center"
              >
                300%
                {scale === 3 ? <CheckIcon></CheckIcon> : null}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Rotate direction={RotateDirection.Forward}>
            {(props: RenderRotateProps) => (
              <Button aria-label="rotate 90 degrees" variant="ghost" onClick={props.onClick}>
                <RotateCw className="h-4 w-4"></RotateCw>
              </Button>
            )}
          </Rotate>
          <PDFFullScreen fileUrl={url} currentPage={parseInt(inputValue)}></PDFFullScreen>
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
                defaultScale={autoFit ? width / baseWidth : scale} // Dynamically scale to container width
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
                plugins={[pageNavigationPluginInstance, zoomPluginInstance, rotatePluginInstance]}
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
