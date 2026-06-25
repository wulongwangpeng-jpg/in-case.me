"use client";

import { EncryptionDemo } from "@/components/home/EncryptionDemo";
import { TrustSlideshow } from "@/components/home/TrustSlideshow";

/** Client-only interactive sections loaded after static SSR content */
export function ClientSections() {
  return (
    <>
      <div className="mt-[60px]">
        <EncryptionDemo />
      </div>
      <TrustSlideshow />
    </>
  );
}
