import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';

interface QRCodeDemoProps {
  barId: string;
  barName: string;
  sunbedId?: string;
  umbrellaId?: string;
}

export const QRCodeDemo = ({ barId, barName, sunbedId, umbrellaId }: QRCodeDemoProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code URL based on the type (sunbed or umbrella)
  const generateQRUrl = () => {
    const baseUrl = `${window.location.origin}/qr-menu/${barId}`;
    if (sunbedId) {
      return `${baseUrl}?sunbed=${sunbedId}`;
    } else if (umbrellaId) {
      return `${baseUrl}?umbrella=${umbrellaId}`;
    }
    return baseUrl;
  };

  const qrCodeUrl = generateQRUrl();
  const spotType = sunbedId ? 'Sunbed' : umbrellaId ? 'Umbrella' : 'General';
  const spotId = sunbedId || umbrellaId || 'General';

  // Generate QR code
  useEffect(() => {
    const generateQRCode = async () => {
      setIsGenerating(true);
      try {
        const dataUrl = await QRCode.toDataURL(qrCodeUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast.error('Failed to generate QR code');
      } finally {
        setIsGenerating(false);
      }
    };

    generateQRCode();
  }, [qrCodeUrl]);

  // Download QR code
  const downloadQRCode = async () => {
    if (!qrCodeDataUrl) return;

    try {
      const link = document.createElement('a');
      link.download = `${barName}-${spotType}-${spotId}-QR.png`;
      link.href = qrCodeDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR Code downloaded successfully!');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  // Copy URL to clipboard
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <QrCode className="h-4 w-4" />
          {spotType} {spotId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-sm text-muted-foreground">Generating QR Code...</p>
            </div>
          ) : qrCodeDataUrl ? (
            <div className="text-center">
              <img 
                src={qrCodeDataUrl} 
                alt={`QR Code for ${barName} ${spotType} ${spotId}`}
                className="w-32 h-32 mx-auto mb-4 rounded-lg shadow-sm"
              />
              <p className="text-sm text-muted-foreground">{barName}</p>
              <p className="text-xs text-muted-foreground">{spotType} {spotId}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">Failed to generate QR Code</p>
            </div>
          )}
        </div>
        
        {/* URL Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Menu URL:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyUrl}
              className="h-6 px-2"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground break-all bg-gray-50 p-2 rounded">
            {qrCodeUrl}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={downloadQRCode} 
            disabled={!qrCodeDataUrl || isGenerating}
            className="flex-1"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            variant="outline" 
            onClick={copyUrl}
            disabled={copied}
            size="sm"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 