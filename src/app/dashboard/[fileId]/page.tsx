import "server-only";

import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import ChatWrapper from "@/components/ChatWrapper";
import PDFRenderer from "@/components/PdfRenderer";

type PageProps = {
  params: Promise<{ fileId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { fileId } = await params;

  // make database call
  const { userId } = await auth();

  if (!userId) {
    redirect(`/auth-callback?origin=dashboard/${fileId}`);
  }

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: userId,
    },
  });

  if (!file) notFound();

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* left side */}
        <div className="flex-1 xl:flex ">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <PDFRenderer url={file.url}></PDFRenderer>
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper></ChatWrapper>
        </div>
      </div>
    </div>
  );
}
