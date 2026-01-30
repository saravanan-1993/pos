"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getWebSettings,
  uploadLogo,
  deleteLogo,
  type WebSettings,
} from "@/services/online-services/webSettingsService";

export const LogoSettings = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<WebSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch web settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await getWebSettings();
      if (response.success) {
        setSettings(response.data);
        setPreviewUrl(response.data.logoUrl);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load logo settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Please select an image smaller than 10MB");
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const response = await uploadLogo(file);

      if (response.success) {
        setSettings((prev) => ({
          ...prev!,
          logoUrl: response.data.logoUrl,
          logoKey: response.data.logoKey,
        }));
        setPreviewUrl(response.data.logoUrl);

        toast.success("Logo uploaded successfully");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await deleteLogo();

      if (response.success) {
        setSettings((prev) => ({
          ...prev!,
          logoUrl: null,
          logoKey: null,
        }));
        setPreviewUrl(null);

        toast.success("Logo deleted successfully");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete logo");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo Settings</CardTitle>
        <CardDescription>
          Upload and manage your store logo. This will be displayed in the sidebar and invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Preview */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Current Logo</label>
          <div className="flex items-center gap-6">
            <div className="relative w-48 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Store Logo"
                  width={192}
                  height={128}
                  className="object-contain max-w-full max-h-full p-2"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No logo uploaded</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleUploadClick}
                disabled={isUploading || isDeleting}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {previewUrl ? "Change Logo" : "Upload Logo"}
                  </>
                )}
              </Button>

              {previewUrl && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isUploading || isDeleting}
                  className="w-full"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Remove Logo
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Guidelines */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Guidelines:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Recommended size: 200x80 pixels or similar aspect ratio</li>
            <li>Supported formats: JPG, PNG, WEBP, GIF</li>
            <li>Maximum file size: 10MB</li>
            <li>Transparent background (PNG) recommended for best results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
