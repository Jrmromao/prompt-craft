import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AvatarUploadProps {
  currentImageUrl?: string;
  userId: string;
  name: string;
}

export function AvatarUpload({ currentImageUrl, userId, name }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useClerk();
  const router = useRouter();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      // Upload to our API
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();

      // Update Clerk user profile
      if (user) {
        await user.setProfileImage({
          file: file,
        });
      }

      toast.success('Profile picture updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group">
      <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
        <AvatarImage src={currentImageUrl} alt={name} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 rounded-full p-1.5 shadow-md border border-gray-200 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
        ) : (
          <Camera className="w-4 h-4 text-purple-500" />
        )}
      </button>
    </div>
  );
} 