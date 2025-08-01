import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Instagram,
  X,
  Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareButtonProps {
  title: string;
  description?: string;
  url: string;
  image?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ShareButton = ({ 
  title, 
  description = '', 
  url, 
  image,
  variant = 'outline',
  size = 'sm',
  className 
}: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description,
    url,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setIsOpen(false);
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to custom share modal
        setIsOpen(true);
      }
    } else {
      // Fallback to custom share modal
      setIsOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this beach bar: ${title}`);
    const body = encodeURIComponent(`${description}\n\n${url}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
    setIsOpen(false);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${title}\n\n${description}\n\n${url}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${title} - ${description}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support direct URL sharing, so we copy the link
    handleCopyLink();
    toast({
      title: "Instagram sharing",
      description: "Link copied! You can now paste it in your Instagram story or bio.",
    });
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {/* Custom Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Share this beach bar</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Copy Link */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>

              {/* Email */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleEmailShare}
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </Button>

              {/* WhatsApp */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleWhatsAppShare}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Share via WhatsApp
              </Button>

              {/* Social Media */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFacebookShare}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Facebook className="h-4 w-4" />
                  <span className="text-xs">Facebook</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTwitterShare}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="text-xs">Twitter</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInstagramShare}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Instagram className="h-4 w-4" />
                  <span className="text-xs">Instagram</span>
                </Button>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-3 bg-muted/50">
                <h4 className="font-medium text-sm mb-1">{title}</h4>
                {description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground truncate">{url}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

// Quick share button for cards
interface QuickShareButtonProps {
  title: string;
  url: string;
  className?: string;
}

export const QuickShareButton = ({ title, url, className }: QuickShareButtonProps) => {
  const handleQuickShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard.",
        });
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleQuickShare}
      className={className}
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}; 