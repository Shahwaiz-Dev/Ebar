import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Waves, User, Building2, LogOut, Settings, Heart, Clock, Shield, Edit3, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileModal } from '@/components/UserProfileModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarLink,
  NavbarToggle,
  NavbarCollapse,
  NavbarCollapseContent,
} from '@/components/ui/navbar';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { currentUser, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (item: any, e: React.MouseEvent) => {
    if (item.type === 'route') {
      e.preventDefault();
      navigate(item.href);
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }, 100);
    } else if (item.type === 'hash') {
      e.preventDefault();
      
      // If we're not on the home page, navigate to home first, then scroll
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete, then scroll
        setTimeout(() => {
          const element = document.querySelector(item.href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // We're already on home page, just scroll
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdate = async (updatedUser: any) => {
    try {
      await updateUserProfile(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const navItems = [
    { label: 'Home', href: '#home', type: 'hash' },
    { label: 'Search', href: '/search', type: 'route' },
    { label: 'Book Spots', href: '/booking', type: 'route' },
    { label: 'How it Works', href: '#how-it-works', type: 'hash' },
    { label: 'Featured', href: '#featured', type: 'hash' },
    { label: 'Contact', href: '/contact', type: 'route' },
  ];

  return (
    <Navbar 
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm"
    >
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between w-full">
        <NavbarBrand 
          className="cursor-pointer"
          onClick={() => {
            navigate('/');
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
            }, 100);
          }}
        >
          <div className="p-2 gradient-primary rounded-xl">
            <Waves className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl lg:text-2xl font-playfair font-bold text-gradient">
            BeachVibe
          </span>
        </NavbarBrand>

        <NavbarContent className="flex">
          {navItems.map((item) => (
            <NavbarItem key={item.label}>
              <NavbarLink
                href={item.href}
                onClick={(e) => handleNavigation(item, e)}
                className="text-foreground hover:text-primary transition-smooth"
              >
                {item.label}
              </NavbarLink>
            </NavbarItem>
          ))}
        </NavbarContent>

        <div className="flex items-center space-x-4">
          {!currentUser ? (
            <>
              <Button variant="ghost" size="lg" onClick={() => {
                navigate('/auth');
                setTimeout(() => {
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                  });
                }, 100);
              }}>
                Sign In
              </Button>
              <Button variant="sunset" size="lg">
                List Your Bar
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="lg" className="rounded-full w-12 h-12 p-0">
                  {currentUser?.type === 'owner' ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.firstName} {currentUser?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Profile Section */}
                <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => {
                  navigate('/dashboard');
                  setTimeout(() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: 'smooth'
                    });
                  }, 100);
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                {currentUser?.type === 'admin' && (
                  <DropdownMenuItem onClick={() => {
                    navigate('/admin');
                    setTimeout(() => {
                      window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth'
                      });
                    }, 100);
                  }}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => {
                  navigate('/favorites');
                  setTimeout(() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: 'smooth'
                    });
                  }, 100);
                }}>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigate('/booking-history');
                  setTimeout(() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: 'smooth'
                    });
                  }, 100);
                }}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Booking History</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden items-center justify-between w-full">
        {/* Hamburger Menu - Left */}
        <NavbarToggle
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-xl bg-primary/10 text-primary"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </NavbarToggle>

        {/* Logo - Center */}
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => {
            navigate('/');
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
            }, 100);
          }}
        >
          <div className="p-2 gradient-primary rounded-xl">
            <Waves className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Profile/Sign In - Right */}
        {!currentUser ? (
          <Button variant="ghost" size="sm" onClick={() => {
            navigate('/auth');
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
            }, 100);
          }}>
            Sign In
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                {currentUser?.type === 'owner' ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Profile Section */}
              <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                <Edit3 className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => {
                navigate('/dashboard');
                setTimeout(() => {
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                  });
                }, 100);
              }}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              {currentUser?.type === 'admin' && (
                <DropdownMenuItem onClick={() => {
                  navigate('/admin');
                  setTimeout(() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: 'smooth'
                    });
                  }, 100);
                }}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => {
                navigate('/favorites');
                setTimeout(() => {
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                  });
                }, 100);
              }}>
                <Heart className="mr-2 h-4 w-4" />
                <span>Favorites</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                navigate('/booking-history');
                setTimeout(() => {
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                  });
                }, 100);
              }}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Booking History</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Mobile Menu */}
      <NavbarCollapse isOpen={isMenuOpen} className="md:hidden">
        <NavbarCollapseContent>
          {navItems.map((item) => (
            <NavbarLink
              key={item.label}
              href={item.href}
              onClick={(e) => {
                handleNavigation(item, e);
                setIsMenuOpen(false);
              }}
              className="text-foreground hover:text-primary transition-smooth"
            >
              {item.label}
            </NavbarLink>
          ))}
          
          <div className="flex flex-col space-y-3 pt-4 border-t border-border">
            {!currentUser ? (
              <>
                <Button variant="ghost" size="lg" className="justify-start" onClick={() => {
                  navigate('/auth');
                  setTimeout(() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: 'smooth'
                    });
                  }, 100);
                }}>
                  Sign In
                </Button>
                <Button variant="sunset" size="lg">
                  List Your Bar
                </Button>
              </>
            ) : (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
                {currentUser?.type === 'owner' && (
                  <Button variant="ghost" size="lg" className="justify-start" onClick={() => {
                    navigate('/dashboard');
                    setTimeout(() => {
                      window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth'
                      });
                    }, 100);
                  }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                {currentUser?.type !== 'owner' && (
                  <>
                    <Button variant="ghost" size="lg" className="justify-start" onClick={() => {
                      navigate('/favorites');
                      setTimeout(() => {
                        window.scrollTo({
                          top: 0,
                          left: 0,
                          behavior: 'smooth'
                        });
                      }, 100);
                    }}>
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </Button>
                    <Button variant="ghost" size="lg" className="justify-start" onClick={() => {
                      navigate('/booking-history');
                      setTimeout(() => {
                        window.scrollTo({
                          top: 0,
                          left: 0,
                          behavior: 'smooth'
                        });
                      }, 100);
                    }}>
                      <Clock className="h-4 w-4 mr-2" />
                      Booking History
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="lg" className="justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </NavbarCollapseContent>
      </NavbarCollapse>
      
      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onUpdate={handleProfileUpdate}
      />
    </Navbar>
  );
};