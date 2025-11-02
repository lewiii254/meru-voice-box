import { useState, useEffect } from "react";
import { FileIcon, Image as ImageIcon, FileText, Download, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Attachment } from "@/types/grievance";
import { formatDate } from "@/lib/grievance-utils";

interface AttachmentListProps {
  grievanceId: string;
}

export default function AttachmentList({ grievanceId }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

  useEffect(() => {
    fetchAttachments();
  }, [grievanceId]);

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('grievance_id', grievanceId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setAttachments(data as Attachment[]);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('grievance-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const previewFile = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('grievance-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
      setPreviewType(attachment.file_type);
      setPreviewName(attachment.file_name);
    } catch (error) {
      console.error('Error previewing file:', error);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewType(null);
    setPreviewName(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
        No attachments uploaded
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {attachments.map((attachment) => {
          const Icon = getFileIcon(attachment.file_type);
          const canPreview = attachment.file_type.startsWith('image/') || attachment.file_type === 'application/pdf';

          return (
            <Card key={attachment.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.file_size)} • {formatDate(attachment.uploaded_at)}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {canPreview && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => previewFile(attachment)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadFile(attachment)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewName}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {previewUrl && previewType?.startsWith('image/') && (
              <img
                src={previewUrl}
                alt={previewName || 'Preview'}
                className="max-w-full h-auto rounded-lg"
              />
            )}
            {previewUrl && previewType === 'application/pdf' && (
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] rounded-lg"
                title={previewName || 'PDF Preview'}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
