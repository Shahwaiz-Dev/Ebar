import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Copy, Check, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  barId: string;
  barName: string;
  type?: 'menu' | 'booking' | 'general';
}

export const QRCodeGenerator = ({ barId, barName, type = 'menu' }: QRCodeGeneratorProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate QR code URL based on type
  const generateQRUrl = () => {
    const baseUrl = window.location.origin;
    switch (type) {
      case 'menu':
        return `${baseUrl}/qr-menu/${barId}`;
      case 'booking':
        return `${baseUrl}/order/${barId}`;
      default:
        return `${baseUrl}/qr-menu/${barId}`;
    }
  };

  const qrCodeUrl = generateQRUrl();

  // Generate QR code
  useEffect(() => {
    const generateQRCode = async () => {
      setIsGenerating(true);
      try {
        const dataUrl = await QRCode.toDataURL(qrCodeUrl, {
          width: 300,
          margin: 3,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
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
      link.download = `${barName}-${type}-QR.png`;
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

  // Share QR code
  const shareQRCode = async () => {
    if (!qrCodeDataUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${barName} - ${type} QR Code`,
          text: `Scan this QR code to access ${barName}`,
          url: qrCodeUrl
        });
      } else {
        // Fallback to copying URL
        copyUrl();
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      copyUrl();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          {barName} - {type.charAt(0).toUpperCase() + type.slice(1)} QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center">
              <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="text-sm text-muted-foreground">Generating QR Code...</p>
            </div>
          ) : qrCodeDataUrl ? (
            <div className="text-center">
              <img 
                src={qrCodeDataUrl} 
                alt={`QR Code for ${barName} ${type}`}
                className="w-48 h-48 mx-auto mb-4 rounded-lg shadow-md"
              />
              <p className="text-sm font-medium text-foreground">{barName}</p>
              <p className="text-xs text-muted-foreground capitalize">{type} Access</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-24 w-24 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">Failed to generate QR Code</p>
            </div>
          )}
        </div>
        
        {/* URL Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Access URL:</p>
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
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={downloadQRCode} 
            disabled={!qrCodeDataUrl || isGenerating}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            variant="outline" 
            onClick={shareQRCode}
            disabled={!qrCodeDataUrl || isGenerating}
            className="w-full"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>How to use:</strong> Print this QR code and place it on tables, sunbeds, or umbrellas. 
            Customers can scan it with their phone camera to access the digital menu and place orders.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 