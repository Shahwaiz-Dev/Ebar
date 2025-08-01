import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  QrCode, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Settings, 
  BarChart3, 
  Users,
  MapPin,
  Phone,
  Mail,
  LogOut
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QRCodeDemo } from '@/components/QRCodeDemo';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { AddBarModal } from '@/components/AddBarModal';
import { AddMenuItemModal } from '@/components/AddMenuItemModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { BookingManagement } from '@/components/BookingManagement';
import { Analytics } from '@/components/Analytics';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useBeachBarsByOwner, useDeleteBeachBar, useUpdateBeachBar } from '@/hooks/useBeachBars';
import { useBookingsByBar } from '@/hooks/useBookings';
import { BeachBar } from '@/lib/firestore';



export const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddBar, setShowAddBar] = useState(false);
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedBar, setSelectedBar] = useState<BeachBar | null>(null);

  // Fetch beach bars for the current owner
  const { data: bars = [], isLoading: barsLoading } = useBeachBarsByOwner(currentUser?.uid || '');
  const deleteBeachBarMutation = useDeleteBeachBar();
  const updateBeachBarMutation = useUpdateBeachBar();

  useEffect(() => {
    // Check if user is authenticated and is a bar owner
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    if (currentUser.type !== 'owner') {
      navigate('/');
      return;
    }
  }, [navigate, currentUser]);

  // Set the first bar as selected when bars are loaded
  useEffect(() => {
    if (bars.length > 0 && !selectedBar) {
      setSelectedBar(bars[0]);
    }
  }, [bars, selectedBar]);

  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while bars are being fetched
  if (barsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your beach bars...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddBar = (newBar: Omit<BeachBar, 'id' | 'createdAt' | 'updatedAt'>) => {
    // This will be handled by the mutation in the AddBarModal component
    setShowAddBar(false);
  };

  const handleAddMenuItem = (newMenuItem: any) => {
    if (!selectedBar) return;
    
    const updatedBar = {
      ...selectedBar,
      menuItems: [...selectedBar.menuItems, newMenuItem]
    };
    
    // Update in Firestore
    updateBeachBarMutation.mutate({
      id: selectedBar.id!,
      updates: { menuItems: updatedBar.menuItems }
    });
    
    setSelectedBar(updatedBar);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    if (!selectedBar) return;
    
    const updatedBar = {
      ...selectedBar,
      menuItems: selectedBar.menuItems.filter(item => item.id !== itemId)
    };
    
    // Update in Firestore
    updateBeachBarMutation.mutate({
      id: selectedBar.id!,
      updates: { menuItems: updatedBar.menuItems }
    });
    
    setSelectedBar(updatedBar);
  };

  const handleDeleteBar = (barId: string) => {
    deleteBeachBarMutation.mutate(barId);
    if (selectedBar?.id === barId) {
      setSelectedBar(bars.find(bar => bar.id !== barId) || null);
    }
  };

  const handleToggleAvailability = (spotId: string, type: 'sunbed' | 'umbrella') => {
    if (!selectedBar) return;
    
    const updatedBar = { ...selectedBar };
    
    if (type === 'sunbed') {
      updatedBar.sunbeds = updatedBar.sunbeds.map(sunbed =>
        sunbed.id === spotId ? { ...sunbed, available: !sunbed.available } : sunbed
      );
    } else {
      updatedBar.umbrellas = updatedBar.umbrellas.map(umbrella =>
        umbrella.id === spotId ? { ...umbrella, available: !umbrella.available } : umbrella
      );
    }
    
    // Update in Firestore
    updateBeachBarMutation.mutate({
      id: selectedBar.id!,
      updates: type === 'sunbed' ? { sunbeds: updatedBar.sunbeds } : { umbrellas: updatedBar.umbrellas }
    });
    
    setSelectedBar(updatedBar);
  };

  const handleUpdateUser = (updatedUser: any) => {
    // This would need to be updated to use the AuthContext updateUserProfile function
    // For now, just show a success message
    toast.success('Profile updated successfully!');
  };

  const handleUpdateBookingStatus = (bookingId: string, status: any) => {
    // Mock booking update - in real app, this would update the database
    toast.success(`Booking ${status} successfully!`);
  };

  // Mock data for analytics
  const analyticsData = {
    revenue: {
      daily: 450,
      weekly: 3200,
      monthly: 12400,
      trend: 'up' as const,
      percentage: 12
    },
    bookings: {
      total: 156,
      pending: 24,
      confirmed: 89,
      completed: 43,
      trend: 'up' as const,
      percentage: 8
    },
    customers: {
      total: 89,
      new: 23,
      returning: 66,
      trend: 'up' as const,
      percentage: 15
    },
    popularItems: [
      { name: 'Sunset Margarita', orders: 45, revenue: 540, category: 'drinks' },
      { name: 'Pina Colada', orders: 38, revenue: 380, category: 'drinks' },
      { name: 'Grilled Fish Tacos', orders: 32, revenue: 576, category: 'food' },
    ],
    topBars: [
      { name: 'Sunset Paradise', bookings: 67, revenue: 3200, rating: 4.9 },
      { name: 'Azure Beach Club', bookings: 45, revenue: 2800, rating: 4.8 },
      { name: 'Tiki Cove', bookings: 34, revenue: 1800, rating: 4.7 },
    ]
  };

  // Mock bookings data
  const mockBookings = [
    {
      id: '1',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '+1 555-0123',
      barName: 'Sunset Paradise',
      date: '2024-01-15',
      time: '14:00',
      guests: 2,
      type: 'sunbed' as const,
      spotId: 'A1',
      total: 45,
      status: 'confirmed' as const,
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1 555-0124',
      barName: 'Sunset Paradise',
      date: '2024-01-15',
      time: '15:30',
      guests: 4,
      type: 'food_order' as const,
      items: [
        { name: 'Sunset Margarita', quantity: 2, price: 12 },
        { name: 'Grilled Fish Tacos', quantity: 1, price: 18 }
      ],
      total: 42,
      status: 'pending' as const,
      createdAt: '2024-01-10T11:30:00Z'
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, {currentUser.firstName}!
                </h1>
                <p className="text-muted-foreground">
                  Manage your beach bars and track your business
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Bars</p>
                    <p className="text-2xl font-bold">{bars.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                    <p className="text-2xl font-bold">$1,240</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Your Bars
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bars.map((bar) => (
                    <div
                      key={bar.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all group relative ${
                        selectedBar?.id === bar.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => setSelectedBar(bar)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{bar.name}</h3>
                          <p className="text-xs text-muted-foreground">{bar.location}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBar(bar.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowAddBar(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Bar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {selectedBar && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedBar.name} - Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-3">Bar Information</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedBar.location}</span>
                              </div>
                              <p className="text-muted-foreground">{selectedBar.description}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-3">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Available Sunbeds</p>
                                <p className="font-semibold">
                                  {selectedBar.sunbeds.filter(s => s.available).length}/{selectedBar.sunbeds.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Available Umbrellas</p>
                                <p className="font-semibold">
                                  {selectedBar.umbrellas.filter(u => u.available).length}/{selectedBar.umbrellas.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Menu Items</p>
                                <p className="font-semibold">{selectedBar.menuItems.length}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Today's Orders</p>
                                <p className="font-semibold">12</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Availability Management */}
                        <div className="mt-6">
                          <h3 className="font-semibold mb-3">Availability Management</h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Sunbeds</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {selectedBar.sunbeds.map((sunbed) => (
                                  <Button
                                    key={sunbed.id}
                                    variant={sunbed.available ? "default" : "secondary"}
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleToggleAvailability(sunbed.id, 'sunbed')}
                                  >
                                    {sunbed.id} - ${sunbed.price}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Umbrellas</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {selectedBar.umbrellas.map((umbrella) => (
                                  <Button
                                    key={umbrella.id}
                                    variant={umbrella.available ? "default" : "secondary"}
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleToggleAvailability(umbrella.id, 'umbrella')}
                                  >
                                    {umbrella.id} - ${umbrella.price}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings" className="space-y-6">
                  <BookingManagement 
                    bookings={mockBookings}
                    onUpdateStatus={handleUpdateBookingStatus}
                  />
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <Analytics data={analyticsData} />
                </TabsContent>

                {/* QR Codes Tab */}
                <TabsContent value="qr-codes" className="space-y-6">
                  {/* General QR Code */}
                  <Card>
                    <CardHeader>
                      <CardTitle>General QR Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        {selectedBar && (
                          <QRCodeGenerator
                            barId={selectedBar.id!}
                            barName={selectedBar.name}
                            type="menu"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Individual Spot QR Codes */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Spot-Specific QR Codes</CardTitle>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedBar?.sunbeds.map((sunbed) => (
                          <QRCodeDemo
                            key={sunbed.id}
                            barId={selectedBar.id!}
                            barName={selectedBar.name}
                            sunbedId={sunbed.id}
                          />
                        ))}
                        {selectedBar?.umbrellas.map((umbrella) => (
                          <QRCodeDemo
                            key={umbrella.id}
                            barId={selectedBar.id!}
                            barName={selectedBar.name}
                            umbrellaId={umbrella.id}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Menu Tab */}
                <TabsContent value="menu" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Menu Items</CardTitle>
                        <Button size="sm" onClick={() => setShowAddMenuItem(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedBar?.menuItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{item.name}</h3>
                                <Badge variant="secondary">{item.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                              <p className="text-lg font-bold text-primary mt-1">${item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-500"
                                onClick={() => handleDeleteMenuItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Business Name</Label>
                          <Input value={currentUser.businessName || 'Not set'} readOnly />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input value={currentUser.email || ''} readOnly />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input value={currentUser.phone || 'Not provided'} readOnly />
                        </div>
                        <div>
                          <Label>Business Address</Label>
                          <Input value={currentUser.businessAddress || 'Not set'} readOnly />
                        </div>
                      </div>
                      <Separator />
                      <Button variant="outline" onClick={() => setShowUserProfile(true)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <AddBarModal 
        isOpen={showAddBar}
        onClose={() => setShowAddBar(false)}
        onAdd={handleAddBar}
      />
      
      <AddMenuItemModal 
        isOpen={showAddMenuItem}
        onClose={() => setShowAddMenuItem(false)}
        onAdd={handleAddMenuItem}
      />

             <UserProfileModal
         isOpen={showUserProfile}
         onClose={() => setShowUserProfile(false)}
         user={currentUser}
         onUpdate={handleUpdateUser}
       />
    </div>
  );
};

export default DashboardPage; 