import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar, Building2 } from 'lucide-react';
import { BackgroundImage } from '@/components/ui/lazy-image';
import heroImage from '@/assets/hero-beach.jpg';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
        opacity: 0,
        y: 50,
      });

      // Hero entrance animation
      const tl = gsap.timeline({ delay: 0.5 });
      
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.6')
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4');

      // Buttons are now fixed - no floating animation
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24"
    >
      {/* Background Image */}
      <BackgroundImage
        src={heroImage}
        alt="Beautiful beach bar at sunset"
        overlay={true}
        overlayOpacity={0.3}
      />

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-0">
        <h1
          ref={titleRef}
          className="text-3xl xs:text-4xl sm:text-5xl lg:text-7xl font-playfair font-bold mb-4 sm:mb-6 leading-tight"
        >
          Your Perfect Beach
          <br />
          <span className="text-gradient bg-gradient-to-r from-blue-200 to-orange-200 bg-clip-text text-transparent">
            Escape Awaits
          </span>
        </h1>
        
        <p
          ref={subtitleRef}
          className="text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 max-w-2xl mx-auto text-white/90 font-light px-2 sm:px-0"
        >
          Discover and reserve the finest beach bars around the world. 
          From sunset cocktails to beachside dining.
        </p>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-sm sm:max-w-none mx-auto">
          <Button variant="hero" size="lg" className="group w-full sm:w-auto sm:text-lg" onClick={() => {
            navigate('/search');
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
            }, 100);
          }}>
            <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Find Beach Bars
          </Button>
          <Button variant="glass" size="lg" className="group w-full sm:w-auto sm:text-lg" onClick={() => {
            navigate('/booking');
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
            }, 100);
          }}>
            <Calendar className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Book Now
          </Button>
          <Button variant="ghost" size="lg" className="group w-full sm:w-auto sm:text-lg text-white hover:bg-white/30" onClick={() => {
            navigate('/auth');
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
            }, 100);
          }}>
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
            List Your Bar
          </Button>
        </div>
      </div>


    </section>
  );
};