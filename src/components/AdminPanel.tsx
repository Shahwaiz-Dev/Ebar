import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Eye, Clock, Shield, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getUnverifiedBars, 
  getBeachBars, 
  verifyBar, 
  unverifyBar, 
  BeachBar,
  getUserById
} from '@/lib/firestore';
import { useEmailService } from '@/hooks/useEmailService';

export const AdminPanel = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { sendBarVerificationEmail } = useEmailService();
  const [selectedBar, setSelectedBar] = useState<BeachBar | null>(null);

  // Check if user is admin
  if (currentUser?.type !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need admin privileges to view this panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch unverified bars
  const { data: unverifiedBars = [], isLoading: loadingUnverified } = useQuery({
    queryKey: ['admin', 'unverified-bars'],
    queryFn: getUnverifiedBars,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch all bars (including verified)
  const { data: allBars = [], isLoading: loadingAll } = useQuery({
    queryKey: ['admin', 'all-bars'],
    queryFn: () => getBeachBars(true), // Include unverified
    staleTime: 30 * 1000, // 30 seconds
  });

  // Verify bar mutation
  const verifyBarMutation = useMutation({
    mutationFn: async (barId: string) => {
      await verifyBar(barId, currentUser!.uid);
      
      // Find the bar to get owner details
      const bar = allBars.find(b => b.id === barId);
      if (bar && bar.ownerId) {
        try {
          const owner = await getUserById(bar.ownerId);
          if (owner) {
            await sendBarVerificationEmail({
              firstName: owner.firstName,
              lastName: owner.lastName,
              email: owner.email,
              barName: bar.name,
              barLocation: bar.location,
              isApproved: true
            });
          }
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          // Don't fail the verification if email fails
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['beachBars'] });
      toast.success('Bar verified successfully! Email notification sent to owner.');
      setSelectedBar(null);
    },
    onError: (error) => {
      console.error('Error verifying bar:', error);
      toast.error('Failed to verify bar. Please try again.');
    },
  });

  // Unverify bar mutation
  const unverifyBarMutation = useMutation({
    mutationFn: async (barId: string) => {
      await unverifyBar(barId);
      
      // Find the bar to get owner details
      const bar = allBars.find(b => b.id === barId);
      if (bar && bar.ownerId) {
        try {
          const owner = await getUserById(bar.ownerId);
          if (owner) {
            await sendBarVerificationEmail({
              firstName: owner.firstName,
              lastName: owner.lastName,
              email: owner.email,
              barName: bar.name,
              barLocation: bar.location,
              isApproved: false,
              rejectionReason: 'Your bar has been unverified and needs to be reviewed again. Please check your bar information and ensure all details are accurate.'
            });
          }
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError);
          // Don't fail the unverification if email fails
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['beachBars'] });
      toast.success('Bar verification removed successfully! Email notification sent to owner.');
      setSelectedBar(null);
    },
    onError: (error) => {
      console.error('Error unverifying bar:', error);
      toast.error('Failed to remove verification. Please try again.');
    },
  });

  const handleVerify = (barId: string) => {
    verifyBarMutation.mutate(barId);
  };

  const handleUnverify = (barId: string) => {
    unverifyBarMutation.mutate(barId);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage bar verifications and oversee platform content
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Website
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Verification ({unverifiedBars.length})
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Verified Bars ({allBars.filter(bar => bar.isVerified).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Bars Pending Verification
              </CardTitle>
              <CardDescription>
                Review and verify bars before they become publicly visible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUnverified ? (
                <div className="text-center py-8">Loading pending bars...</div>
              ) : unverifiedBars.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bars pending verification
                </div>
              ) : (
                <div className="space-y-4">
                  {unverifiedBars.map((bar) => (
                    <Card key={bar.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{bar.name}</h3>
                              <Badge variant="secondary">Pending</Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{bar.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>📍 {bar.location}</span>
                              <span>🏷️ {bar.category}</span>
                              <span>💰 {bar.priceRange}</span>
                            </div>
                            <div className="mt-2">
                              <span className="text-sm text-muted-foreground">
                                Created: {formatDate(bar.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBar(bar)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleVerify(bar.id!)}
                              disabled={verifyBarMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Verified Bars
              </CardTitle>
              <CardDescription>
                All bars that have been verified and are publicly visible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAll ? (
                <div className="text-center py-8">Loading verified bars...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bar Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Verified Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allBars
                      .filter(bar => bar.isVerified)
                      .map((bar) => (
                        <TableRow key={bar.id}>
                          <TableCell className="font-medium">{bar.name}</TableCell>
                          <TableCell>{bar.location}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{bar.category}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(bar.verifiedAt)}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBar(bar)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUnverify(bar.id!)}
                                disabled={unverifyBarMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Unverify
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bar Details Modal */}
      {selectedBar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedBar.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBar(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedBar.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <p className="text-muted-foreground">{selectedBar.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <Badge variant="outline">{selectedBar.category}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Price Range</h4>
                  <Badge variant="outline">{selectedBar.priceRange}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBar.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Menu Items</h4>
                <div className="space-y-2">
                  {selectedBar.menuItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({item.category})</span>
                      </div>
                      <span className="font-semibold">€{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Created</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedBar.createdAt)}</p>
                </div>
                {selectedBar.isVerified && (
                  <div>
                    <h4 className="font-semibold mb-2">Verified</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedBar.verifiedAt)}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                {!selectedBar.isVerified ? (
                  <Button
                    onClick={() => handleVerify(selectedBar.id!)}
                    disabled={verifyBarMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Bar
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => handleUnverify(selectedBar.id!)}
                    disabled={unverifyBarMutation.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove Verification
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
