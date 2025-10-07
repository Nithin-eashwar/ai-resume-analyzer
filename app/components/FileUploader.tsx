import { on } from "events";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "~/lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
}

function FileUploader({ onFileSelect }: FileUploaderProps) {
  // This tells us what to do when a file is dropped
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Do something with the files
      const file = acceptedFiles[0] || null;
      console.log("File selected:", file?.name, "Size:", file?.size);

      onFileSelect?.(file);
    },
    [onFileSelect]
  );
  const maxFileSize = 20 * 1024 * 1024; // 20 MB

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: { "application/pdf": [".pdf"] },
      maxSize: 20 * 1024 * 1024, // 20 MB
    });
  const file = acceptedFiles[0] || null;

  return (
    // <div className="w-full gradient-border">
    <div
      {...getRootProps({ className: "w-full gradient-border cursor-pointer" })}
    >
      <input {...getInputProps()} />
      <div className="space-y-4 cursor-pointer">
        {file ? (
          <div
            className="uploader-selected-file"
            onClick={(e) => e.stopPropagation()}
          >
            <img src="/images/pdf.png" alt="pdf" className="size-10" />
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mx-auto flex items-center justify-center mb-2">
              <img src="/icons/info.svg" alt="upload" className="size-20" />
            </div>
            {isDragActive ? (
              <p className="text-lg text-blue-600 font-semibold">
                Drop your PDF file here...
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-500">
                  <span className="font-semibold">Click to Upload</span> or drag
                  and drop
                </p>
                <p className="text-lg text-gray-500">
                  PDF (max {formatSize(maxFileSize)})
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
    // </div>
  );
}

export default FileUploader;
