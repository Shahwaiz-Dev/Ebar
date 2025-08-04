import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, MapPin, Clock, Users, User } from 'lucide-react';
import { LazyImage } from '@/components/ui/lazy-image';
import { QuickShareButton } from '@/components/ui/share-button';
import { useBeachBars } from '@/hooks/useBeachBars';
import { useReviewsForMultipleBars } from '@/hooks/useReviews';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const FeaturedBars = () => {
  const navigate = useNavigate();
  const { data: beachBars = [], isLoading } = useBeachBars();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Get the first 3 beach bars as featured bars
  const featuredBars = beachBars.slice(0, 3);
  const barIds = featuredBars.map(bar => bar.id!).filter(Boolean);
  
  // Get reviews for featured bars
  const { data: reviewsByBar = {} } = useReviewsForMultipleBars(barIds);

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

  const handleBookNow = (barId: string) => {
    // Navigate to booking page with the selected bar
    navigate(`/order/${barId}`);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleViewAllBars = () => {
    // Navigate to search page to view all bars
    navigate('/search');
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleCardClick = (barId: string) => {
    // Navigate to order page when clicking on the card
    navigate(`/order/${barId}`);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-6">
              Featured <span className="text-gradient">Beach Bars</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked destinations offering the ultimate beachside experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-64 rounded-t-lg"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
          {featuredBars.map((bar) => {
            const barReviews = reviewsByBar[bar.id!] || [];
            const recentReviews = barReviews.slice(0, 2); // Show 2 most recent reviews
            
            return (
              <Card
                key={bar.id}
                className="group hover:shadow-strong transition-smooth cursor-pointer overflow-hidden border-0 shadow-medium hover:-translate-y-2 flex flex-col h-full"
                onClick={() => handleCardClick(bar.id!)}
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
                    ${bar.sunbeds.length > 0 ? bar.sunbeds[0].price : 50}
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
                        2-12 guests
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-semibold">{bar.rating}</span>
                        <span className="text-sm text-muted-foreground ml-1">({bar.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col">
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {bar.description}
                  </p>

                  {/* Recent Reviews */}
                  {recentReviews.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Recent Reviews</h4>
                      <div className="space-y-2">
                        {recentReviews.map((review) => (
                          <div key={review.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                            <div className="flex-shrink-0">
                              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {review.user?.photoURL ? (
                                  <img 
                                    src={review.user.photoURL} 
                                    alt={review.user.displayName || 'User'} 
                                    className="h-full w-full object-cover" 
                                  />
                                ) : (
                                  <User className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium truncate">
                                  {review.user?.firstName ? `${review.user.firstName} ${review.user.lastName}` : review.user?.displayName || 'Anonymous User'}
                                </span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${review.rating > i ? 'text-yellow-400' : 'text-gray-300'}`}
                                      fill={review.rating > i ? 'currentColor' : 'none'}
                                      strokeWidth={review.rating > i ? 0 : 1}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                "{review.comment}"
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {bar.amenities.slice(0, 3).map((amenity, index) => (
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
                        handleBookNow(bar.id!);
                      }}
                    >
                      Book Now
                      <Clock className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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