import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, MapPin, Clock, Users } from 'lucide-react';
import { LazyImage } from '@/components/ui/lazy-image';
import { QuickShareButton } from '@/components/ui/share-button';
import featuredBar1 from '@/assets/featured-bar-1.jpg';
import featuredBar2 from '@/assets/featured-bar-2.jpg';
import featuredBar3 from '@/assets/featured-bar-3.jpg';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const FeaturedBars = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
          }
        }
      );

      // Cards animation - simplified to preserve layout
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 70%',
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const featuredBars = [
    {
      id: 1,
      name: 'Sunset Paradise',
      image: featuredBar1,
      rating: 4.9,
      reviews: 128,
      location: 'Santorini, Greece',
      description: 'Iconic cliffside bar with breathtaking sunset views and world-class cocktails.',
      price: '$85',
      amenities: ['Infinity Pool', 'Live DJ', 'Sunset Views'],
      capacity: '2-12 guests',
    },
    {
      id: 2,
      name: 'Azure Beach Club',
      image: featuredBar2,
      rating: 4.8,
      reviews: 95,
      location: 'Mykonos, Greece',
      description: 'Luxury beach club featuring modern architecture and premium beachside service.',
      price: '$120',
      amenities: ['Beach Beds', 'Fine Dining', 'VIP Service'],
      capacity: '2-8 guests',
    },
    {
      id: 3,
      name: 'Tiki Cove',
      image: featuredBar3,
      rating: 4.7,
      reviews: 156,
      location: 'Bali, Indonesia',
      description: 'Authentic tropical experience with bamboo architecture and signature cocktails.',
      price: '$45',
      amenities: ['Tiki Bar', 'Beach Games', 'Local Cuisine'],
      capacity: '2-15 guests',
    },
  ];

  const handleBookNow = (barId: number) => {
    // Navigate to booking page with the selected bar
    navigate(`/order/${barId}`);
  };

  const handleViewAllBars = () => {
    // Navigate to search page to view all bars
    navigate('/search');
  };

  const handleCardClick = (barId: number) => {
    // Navigate to order page when clicking on the card
    navigate(`/order/${barId}`);
  };

  return (
    <section
      ref={sectionRef}
      id="featured"
      className="py-16 lg:py-24 bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-6"
          >
            Featured <span className="text-gradient">Beach Bars</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked destinations offering the ultimate beachside experience
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredBars.map((bar) => (
            <Card
              key={bar.id}
              className="group hover:shadow-strong transition-smooth cursor-pointer overflow-hidden border-0 shadow-medium hover:-translate-y-2 flex flex-col h-full"
              onClick={() => handleCardClick(bar.id)}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <LazyImage
                  src={bar.image}
                  alt={bar.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-smooth duration-500"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <QuickShareButton
                    title={bar.name}
                    url={`${window.location.origin}/search?bar=${bar.id}`}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  />
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold">{bar.rating}</span>
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-primary text-white rounded-full px-3 py-1 text-sm font-semibold">
                  {bar.price}
                </div>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-playfair font-semibold text-foreground mb-2">
                      {bar.name}
                    </h3>
                    <div className="flex items-center text-muted-foreground text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {bar.location}
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {bar.capacity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {bar.reviews} reviews
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 flex-1 flex flex-col">
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {bar.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {bar.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  <Button 
                    variant="ocean" 
                    className="w-full group"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking button
                      handleBookNow(bar.id);
                    }}
                  >
                    Book Now
                    <Clock className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="group"
            onClick={handleViewAllBars}
          >
            View All Beach Bars
            <MapPin className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};