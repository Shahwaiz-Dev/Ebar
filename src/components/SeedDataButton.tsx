import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { seedBeachBars, checkIfDataExists } from '@/utils/seedData';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const SeedDataButton = () => {
  const { currentUser } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasData, setHasData] = useState(false);

  const handleSeedData = async () => {
    if (!currentUser?.uid) {
      toast.error('Please sign in first to seed data.');
      return;
    }
    
    setIsSeeding(true);
    try {
      await seedBeachBars(currentUser.uid);
      setHasData(true);
      toast.success('Sample data seeded successfully!');
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed data. Please try again.');
    } finally {
      setIsSeeding(false);
    }
  };

  const checkData = async () => {
    const exists = await checkIfDataExists();
    setHasData(exists);
  };

  // Check for existing data on component mount
  useEffect(() => {
    checkData();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleSeedData}
        disabled={isSeeding || hasData || !currentUser}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {isSeeding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        {isSeeding ? 'Seeding...' : hasData ? 'Data Seeded' : 'Seed Test Data'}
      </Button>
    </div>
  );
}; 