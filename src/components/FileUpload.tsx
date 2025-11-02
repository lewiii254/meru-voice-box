import { useState, useRef } from "react";
import { Upload, X, FileIcon, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Attachment } from "@/types/grievance";

interface FileUploadProps {
  grievanceId?: string;
  onUploadComplete?: (attachment: Attachment) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  disabled?: boolean;
}

const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
];

export default function FileUpload({
  grievanceId,
  onUploadComplete,
  maxSizeMB = 5,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      // Validate file size
      if (file.size > maxSizeBytes) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxSizeMB}MB limit`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an allowed file type`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!grievanceId) {
      toast({
        title: "Error",
        description: "Grievance ID is required to upload files",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        // Generate unique filename using crypto.randomUUID for better collision prevention
        const uniqueId = crypto.randomUUID();
        const fileName = `${grievanceId}/${uniqueId}-${file.name}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('grievance-attachments')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { data: attachmentData, error: attachmentError } = await supabase
          .from('attachments')
          .insert({
            grievance_id: grievanceId,
            file_name: file.name,
            file_path: uploadData.path,
            file_type: file.type,
            file_size: file.size,
          })
          .select()
          .single();

        if (attachmentError) throw attachmentError;

        if (onUploadComplete && attachmentData) {
          onUploadComplete(attachmentData as Attachment);
        }
      }

      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`,
      });

      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return ImageIcon;
    if (fileType === 'application/pdf') return FileText;
    return FileIcon;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        Select Files
      </Button>

      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {files.map((file, index) => {
                const Icon = getFileIcon(file.type);
                return (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {grievanceId && (
              <Button
                type="button"
                onClick={uploadFiles}
                disabled={uploading}
                className="w-full mt-4"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {files.length} File(s)
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Max file size: {maxSizeMB}MB. Allowed types: Images (JPEG, PNG, GIF, WebP), PDF
      </p>
    </div>
  );
}
