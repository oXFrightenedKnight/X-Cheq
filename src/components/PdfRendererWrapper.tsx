"use client";

import dynamic from "next/dynamic";

// Dynamically import the PDF renderer to prevent any SSR evaluation
const PDFRenderer = dynamic(() => import("@/components/PdfRenderer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-40 text-zinc-500">Loading PDF...</div>
  ),
});

export default function PDFRendererWrapper({ url }: { url: string }) {
  return <PDFRenderer url={url}></PDFRenderer>;
}
