"use client";

import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFRendererProps {
  url: string;
}

const PDFRenderer = ({ url }: PDFRendererProps) => {
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">Toolbar</div>
      </div>{" "}
      {/* toolbar of pdf */}
      <div className="flex-1 w-full max-h-screen">
        <div>
          <Document file={url} className="max-h-full">
            <Page pageNumber={1}></Page>
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFRenderer;
