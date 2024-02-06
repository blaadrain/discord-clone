"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";

type FileUploadProps = {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
};

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  const fileType = value?.split(".").pop();

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image fill src={value} alt="Uploaded image" className="rounded-full" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-0 top-0 rounded-full bg-rose-500 p-1 text-white shadow-sm transition hover:bg-rose-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      appearance={{
        button:
          "bg-indigo-500 hover:bg-indigo-500/90 ut-uploading:cursor-not-allowed",
        label: "text-indigo-500 hover:text-indigo-500/90",
      }}
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.error(error);
      }}
    />
  );
};
