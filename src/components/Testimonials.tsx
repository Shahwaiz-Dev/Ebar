import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Testimonials = () => {
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

      // Cards animation
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.2,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 70%',
            }
          }
        );

        // Floating animation
        Array.from(cards).forEach((card, index) => {
          gsap.to(card, {
            y: Math.sin(index) * 5,
            duration: 3 + index,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: -1,
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=80&h=80&fit=crop&crop=face',
      location: 'New York, USA',
      rating: 5,
      text: 'BeachVibe made our honeymoon in Santorini absolutely perfect! The reservation process was seamless, and the sunset spot we booked exceeded all expectations.',
      experience: 'Honeymoon in Santorini',
    },
    {
      id: 2,
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      location: 'Singapore',
      rating: 5,
      text: 'As a frequent traveler, I can say BeachVibe is a game-changer. Found hidden gems in Bali that I would never have discovered otherwise. The local recommendations were spot-on!',
      experience: 'Business Trip to Bali',
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
      location: 'Barcelona, Spain',
      rating: 5,
      text: 'Organized a surprise birthday party for my best friend using BeachVibe. The staff at the beach bar went above and beyond to make it special. Highly recommend!',
      experience: 'Birthday Celebration',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-6"
          >
            What Our <span className="text-gradient">Guests Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from travelers who found their perfect beach escape
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={`relative hover:shadow-strong transition-smooth border-0 shadow-medium ${
                index === 1 ? 'lg:scale-105 lg:shadow-strong' : ''
              }`}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Quote className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4 mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Experience Badge */}
                <div className="bg-secondary rounded-full px-3 py-1 text-xs font-medium text-secondary-foreground mb-4 inline-block">
                  {testimonial.experience}
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4 shadow-soft"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-medium max-w-2xl mx-auto">
            <h3 className="text-2xl font-playfair font-bold text-foreground mb-4">
              Ready for Your Beach Adventure?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of satisfied travelers who found their perfect beach escape
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-smooth shadow-soft hover:shadow-medium">
                Start Exploring
              </button>
              <button className="border border-primary text-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary/5 transition-smooth">
                Share Your Story
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};