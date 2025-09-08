import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Info } from 'lucide-react';

interface PlatformFeeDisplayProps {
  totalAmount: number;
  platformFeePercentage: number;
  barOwnerPayout?: number;
  platformFee?: number;
  showBreakdown?: boolean;
}

export const PlatformFeeDisplay = ({
  totalAmount,
  platformFeePercentage,
  barOwnerPayout,
  platformFee,
  showBreakdown = true
}: PlatformFeeDisplayProps) => {
  const calculatedPlatformFee = platformFee || (totalAmount * platformFeePercentage / 100);
  const calculatedBarPayout = barOwnerPayout || (totalAmount - calculatedPlatformFee);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Amount */}
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total Amount</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>

        {showBreakdown && (
          <>
            <Separator />
            
            {/* Platform Fee */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Platform Fee ({platformFeePercentage}%)</span>
                <Badge variant="secondary" className="text-xs">
                  Your Revenue
                </Badge>
              </div>
              <span className="text-green-600 font-medium">
                +${calculatedPlatformFee.toFixed(2)}
              </span>
            </div>

            {/* Bar Owner Payout */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Bar Owner Payout</span>
                <Badge variant="outline" className="text-xs">
                  To Bar Owner
                </Badge>
              </div>
              <span className="text-muted-foreground">
                -${calculatedBarPayout.toFixed(2)}
              </span>
            </div>

            <Separator />

            {/* Summary */}
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Platform keeps:</span>
                <span className="font-medium text-green-600">
                  ${calculatedPlatformFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bar owner receives:</span>
                <span className="font-medium">
                  ${calculatedBarPayout.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Info Note */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            Platform fees are automatically calculated and transferred. 
            Bar owners receive payouts directly to their connected bank accounts.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
