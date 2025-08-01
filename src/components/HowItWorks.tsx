import { useEffect, useRef } from 'react';
import { Search, Calendar, Coffee } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      // Steps animation
      const steps = stepsRef.current?.children;
      if (steps) {
        gsap.fromTo(steps,
          { opacity: 0, y: 50, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.2,
            scrollTrigger: {
              trigger: stepsRef.current,
              start: 'top 70%',
            }
          }
        );
      }

      // Animate connector lines
      lineRefs.current.forEach((lineRef, index) => {
        if (lineRef) {
          gsap.fromTo(
            lineRef,
            {
              scaleX: 0,
              transformOrigin: 'left center',
            },
            {
              scaleX: 1,
              duration: 0.8,
              ease: 'power2.out',
              delay: 0.3 + (index * 0.2),
              scrollTrigger: {
                trigger: lineRef,
                start: 'top 80%',
              }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      icon: Search,
      title: 'Search & Book',
      description: 'Find your perfect beach bar and reserve sunbeds or umbrellas. Choose your preferred date and time.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: Calendar,
      title: 'Scan & Order',
      description: 'Scan the QR code at your spot to access the digital menu. Order food and drinks for delivery.',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      icon: Coffee,
      title: 'Relax & Enjoy',
      description: 'Your order is delivered directly to your sunbed or umbrella. Enjoy premium beachside service.',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-orange-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-foreground mb-6"
          >
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple steps to your perfect beach experience
          </p>
        </div>

        <div
          ref={stepsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative text-center group hover:scale-105 transition-smooth"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-medium">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`w-20 h-20 ${step.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:shadow-medium transition-smooth`}>
                <step.icon className={`h-10 w-10 ${step.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-playfair font-semibold text-foreground mb-4">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div 
                  ref={(el) => (lineRefs.current[index] = el)}
                  className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent transform translate-x-4 origin-left"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};