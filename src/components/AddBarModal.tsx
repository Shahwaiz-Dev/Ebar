import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBeachBar } from '@/hooks/useBeachBars';
import { toast } from 'sonner';
import { BeachBar } from '@/lib/firestore';
import { GoogleMapsSearch } from '@/components/GoogleMapsSearch';
import { PlaceResult } from '@/lib/googleMaps';

interface AddBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bar: Omit<BeachBar, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const availableAmenities = [
  'WiFi', 'Pool', 'Restaurant', 'Bar', 'Beach Access', 'Parking',
  'Spa', 'Water Sports', 'Live Music', 'VIP Service', 'Infinity Pool',
  'Fine Dining', 'Tiki Bar', 'Local Cuisine', 'Snorkeling'
];

export const AddBarModal = ({ isOpen, onClose, onAdd }: AddBarModalProps) => {
  const { currentUser } = useAuth();
  const createBeachBarMutation = useCreateBeachBar();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    category: 'standard' as 'premium' | 'standard' | 'budget',
    priceRange: 'medium' as 'low' | 'medium' | 'high',
    amenities: [] as string[],
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    sunbeds: [
      { id: 'A1', type: 'Standard', price: 25, available: true },
      { id: 'A2', type: 'Standard', price: 25, available: true },
      { id: 'A3', type: 'Premium', price: 35, available: true },
      { id: 'A4', type: 'Premium', price: 35, available: true },
    ],
    umbrellas: [
      { id: 'U1', type: 'Standard', price: 15, available: true },
      { id: 'U2', type: 'Standard', price: 15, available: true },
      { id: 'U3', type: 'Large', price: 20, available: true },
    ],
    menuItems: [] as any[]
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // Handle Google Maps place selection
  const handlePlaceSelect = (place: PlaceResult) => {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address;
    
    setSelectedLocation({ lat, lng, address });
    setFormData(prev => ({
      ...prev,
      location: address,
      coordinates: { latitude: lat, longitude: lng }
    }));
  };

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    setFormData(prev => ({
      ...prev,
      location: address,
      coordinates: { latitude: lat, longitude: lng }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.uid) {
      toast.error('You must be logged in to add a bar');
      return;
    }

    if (!formData.name || !formData.location || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedLocation) {
      toast.error('Please select a location using the map or search');
      return;
    }

    try {
      const barData = {
        ...formData,
        ownerId: currentUser.uid,
        rating: 0,
        reviewCount: 0,
        image: '/src/assets/featured-bar-1.jpg' // Default image
      };

      await createBeachBarMutation.mutateAsync(barData);
      toast.success('Beach bar added successfully!');
      onAdd(barData);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        description: '',
        category: 'standard',
        priceRange: 'medium',
        amenities: [],
        coordinates: { latitude: 0, longitude: 0 },
        sunbeds: [
          { id: 'A1', type: 'Standard', price: 25, available: true },
          { id: 'A2', type: 'Standard', price: 25, available: true },
          { id: 'A3', type: 'Premium', price: 35, available: true },
          { id: 'A4', type: 'Premium', price: 35, available: true },
        ],
        umbrellas: [
          { id: 'U1', type: 'Standard', price: 15, available: true },
          { id: 'U2', type: 'Standard', price: 15, available: true },
          { id: 'U3', type: 'Large', price: 20, available: true },
        ],
        menuItems: []
      });
      setSelectedLocation(null);
    } catch (error) {
      toast.error('Failed to add beach bar. Please try again.');
    }
  };

  const addAmenity = () => {
    if (newAmenity && !formData.amenities.includes(newAmenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Beach Bar</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="basic" className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Bar Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter bar name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your beach bar..."
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priceRange">Price Range</Label>
                    <Select value={formData.priceRange} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priceRange: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                
                <div className="flex gap-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Add amenity"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  />
                  <Button type="button" onClick={addAmenity} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  Popular amenities: {availableAmenities.slice(0, 5).join(', ')}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              {/* Location Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Location</h3>
                
                {/* Google Maps Search */}
                <div className="space-y-4">
                  <GoogleMapsSearch
                    onPlaceSelect={handlePlaceSelect}
                    onLocationSelect={handleLocationSelect}
                    placeholder="Search for your beach bar location..."
                    className="w-full"
                  />
                  
                  {/* Selected Location Display */}
                  {selectedLocation && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{selectedLocation.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLocation(null);
                          setFormData(prev => ({
                            ...prev,
                            location: '',
                            coordinates: { latitude: 0, longitude: 0 }
                          }));
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Coordinates Display */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location Details</h3>
                {selectedLocation ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.coordinates.latitude}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          coordinates: { ...prev.coordinates, latitude: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0.000000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.coordinates.longitude}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          coordinates: { ...prev.coordinates, longitude: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0.000000"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select a location first</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createBeachBarMutation.isPending}>
                {createBeachBarMutation.isPending ? 'Adding...' : 'Add Beach Bar'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 