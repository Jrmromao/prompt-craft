"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

export interface AvatarUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: Error) => void;
  currentImageUrl?: string;
  userId: string;
  name: string;
}

export function AvatarUpload({ onUploadComplete, onUploadError, currentImageUrl, userId, name }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      const file = acceptedFiles[0];

      try {
        // Create form data
        const formData = new FormData();
        formData.append("file", file);

        // Upload to your API endpoint
        const response = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        onUploadComplete(data.url);
      } catch (error) {
        onUploadError(error instanceof Error ? error : new Error("Upload failed"));
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Upload</span>
        </div>
      )}
    </div>
  );
} 