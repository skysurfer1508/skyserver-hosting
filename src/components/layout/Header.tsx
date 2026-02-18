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
  Terminal,
  ExternalLink,
  MessageCircle,
  Heart,
} from 'lucide-react';
import { useState } from 'react';
import { DISCORD_INVITE_URL, EXTERNAL_LINKS } from '@/config/constants';

const games = [
  { name: 'Minecraft', icon: '⛏️', href: '#features' },
  { name: 'Terraria', icon: '🌳', href: '#features' },
  { name: 'Satisfactory', icon: '🏭', href: '#features' },
  { name: 'CS2', icon: '🎯', href: '#features' },
  { name: 'Factorio', icon: '⚙️', href: '#features' },
  { name: 'Rust', icon: '🔥', href: '#features' },
];

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Features', href: '#features', icon: Zap },
  { name: 'Roadmap', href: '#roadmap', icon: Map },
  { name: 'FAQ', href: '#faq', icon: HelpCircle },
  { name: 'Tech Stack', href: '#tech-stack', icon: Cpu },
  { name: 'Free vs. Permanent', href: '/compare', icon: Zap, isRoute: true },
  { name: 'Help Center', href: '/help', icon: HelpCircle, isRoute: true },
  { name: 'Imprint', href: '/imprint', icon: Server, isRoute: true },
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

  const handleNavClick = (href: string, external?: boolean, isRoute?: boolean) => {
    setMenuOpen(false);
    if (external) {
      window.open(href, '_blank');
      return;
    }
    if (isRoute) {
      navigate(href);
      return;
    }
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

        {/* Auth Buttons + Game Panel + Discord + Hamburger Menu - Right */}
        <div className="flex items-center gap-2">
          {/* Discord Button */}
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-[#5865F2]/10 hover:text-[#5865F2] transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Join Discord</span>
            </Button>
          </a>

          {/* Support Us */}
          <a
            href={EXTERNAL_LINKS.donate}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Support Us</span>
            </Button>
          </a>

          {/* Game Panel - Always Visible */}
          <a
            href={EXTERNAL_LINKS.gamePanel}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Terminal className="h-4 w-4" />
              <span className="hidden md:inline">Game Panel</span>
            </Button>
          </a>

          {user ? (
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="glow-primary hidden sm:flex">
                  Get Started
                </Button>
              </Link>
            </>
          )}
          
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

              {/* Other nav items */}
              {navItems.slice(1).map((item) => {
                // On home page, show all items; elsewhere, only show route-based items
                const shouldShow = isHomePage || item.isRoute;
                if (!shouldShow) return null;
                
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-base"
                    onClick={() => handleNavClick(item.href, false, item.isRoute)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                );
              })}

              {/* Discord - Mobile only (shown in menu) */}
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden"
                onClick={() => setMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-between gap-3 h-12 text-base hover:bg-[#5865F2]/10 hover:text-[#5865F2]"
                >
                  <span className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5" />
                    Join Discord
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              </a>

              {/* Game Panel - Mobile only (shown in menu) */}
              <a
                href={EXTERNAL_LINKS.gamePanel}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden"
                onClick={() => setMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-between gap-3 h-12 text-base"
                >
                  <span className="flex items-center gap-3">
                    <Terminal className="h-5 w-5" />
                    Game Panel
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              </a>

              {/* Support the Project - Mobile only */}
              <a
                href={EXTERNAL_LINKS.donate}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden"
                onClick={() => setMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-between gap-3 h-12 text-base hover:bg-red-500/10 hover:text-red-400"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="h-5 w-5" />
                    Support the Project
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              </a>

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
      </div>
    </header>
  );
}
