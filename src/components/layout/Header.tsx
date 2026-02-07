import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  LogOut,
  User,
  Settings,
  Menu,
  Server,
  Home,
  Gamepad2,
  Zap,
  Map,
  HelpCircle,
  Cpu,
  ChevronDown,
  X,
} from 'lucide-react';
import { useState } from 'react';

const games = [
  { name: 'Minecraft', icon: '⛏️', href: '#features' },
  { name: 'Terraria', icon: '🌳', href: '#features' },
  { name: 'Satisfactory', icon: '🏭', href: '#features' },
];

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Features', href: '#features', icon: Zap },
  { name: 'Roadmap', href: '#roadmap', icon: Map },
  { name: 'FAQ', href: '#faq', icon: HelpCircle },
  { name: 'Tech Stack', href: '#tech-stack', icon: Cpu },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith('#')) {
      // If we're on the home page, scroll to section
      if (location.pathname === '/') {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Navigate to home page with hash
        navigate('/' + href);
      }
    } else if (href === '/') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo - Left */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-primary">
            <Server className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider text-primary glow-text-primary">
            SkyServer
          </span>
        </Link>

        {/* Hamburger Menu - Right */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-80 bg-card border-l border-border p-0 flex flex-col"
          >
            {/* Header */}
            <SheetHeader className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Server className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-primary">
                    SkyServer
                  </span>
                </SheetTitle>
              </div>
            </SheetHeader>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
              {/* Home */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-base"
                onClick={() => handleNavClick('/')}
              >
                <Home className="h-5 w-5" />
                Home
              </Button>

              {/* Games Collapsible - only on home page */}
              {isHomePage && (
                <Collapsible open={gamesOpen} onOpenChange={setGamesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between gap-3 h-12 text-base"
                    >
                      <span className="flex items-center gap-3">
                        <Gamepad2 className="h-5 w-5" />
                        Games
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          gamesOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-8 space-y-1 mt-1">
                    {games.map((game) => (
                      <Button
                        key={game.name}
                        variant="ghost"
                        className="w-full justify-start gap-3 h-10 text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => handleNavClick(game.href)}
                      >
                        <span className="text-lg">{game.icon}</span>
                        {game.name}
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Other nav items - only on home page */}
              {isHomePage &&
                navItems.slice(1).map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-base"
                    onClick={() => handleNavClick(item.href)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                ))}

              {/* Spacer */}
              <div className="flex-1" />
            </nav>

            {/* Auth Section - Bottom */}
            <div className="border-t border-border p-4 space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                      <User className="h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                        <Settings className="h-5 w-5" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-12">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full h-12 glow-primary">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
