import React, { useState, useEffect } from "react";
import { Download, Loader, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function AssetPreview({ asset, onClose }) {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asset.file_uri) {
      getDownloadUrl();
    }
  }, [asset]);

  const getDownloadUrl = async () => {
    try {
      const res = await base44.functions.invoke('getAssetDownloadUrl', { assetId: asset.id });
      setDownloadUrl(res.data.signed_url);
    } catch (error) {
      console.error('Error getting download URL:', error);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = asset.title;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading:', error);
    } finally {
      setLoading(false);
    }
  };

  const isVideo = asset.type === 'video' || asset.file_uri?.includes('.mp4');
  const isImage = asset.type === 'cover' || asset.type === 'model_3d';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1a2e]">
          <h3 className="text-xl font-bold text-white">{asset.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Preview */}
          <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center">
            {isVideo ? (
              <video
                src={downloadUrl}
                controls
                className="w-full h-full"
              />
            ) : asset.preview_image_url ? (
              <img src={asset.preview_image_url} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="text-gray-500 flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Cargando vista previa...
              </div>
            )}
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Tipo</p>
              <p className="text-white font-medium capitalize">{asset.type}</p>
            </div>
            {asset.file_size_mb && (
              <div>
                <p className="text-gray-500">Tamaño</p>
                <p className="text-white font-medium">{asset.file_size_mb.toFixed(2)} MB</p>
              </div>
            )}
            {asset.duration_seconds && (
              <div>
                <p className="text-gray-500">Duración</p>
                <p className="text-white font-medium">{Math.round(asset.duration_seconds)}s</p>
              </div>
            )}
          </div>

          {/* Download */}
          {downloadUrl && (
            <Button
              onClick={handleDownload}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 gap-2"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Descargar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}