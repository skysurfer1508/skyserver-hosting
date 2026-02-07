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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      // If we're on the home page, scroll to section
      if (location.pathname === '/') {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Navigate to home page with hash
        navigate('/' + href);
      }
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-primary">
            <Server className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider text-primary glow-text-primary">
            SkyServer
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {isHomePage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick('/')}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>

              {/* Games Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    Games
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {games.map((game) => (
                    <DropdownMenuItem
                      key={game.name}
                      onClick={() => handleNavClick(game.href)}
                      className="gap-2 cursor-pointer"
                    >
                      <span>{game.icon}</span>
                      <span>{game.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {navItems.slice(1).map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick(item.href)}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              ))}
            </>
          )}
        </nav>

        {/* Right Side - Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="glow-primary">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu - Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-background border-border">
            <SheetHeader className="border-b border-border pb-4">
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Server className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold text-primary">
                  SkyServer
                </span>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 py-4">
              {/* Home */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleNavClick('/')}
              >
                <Home className="h-5 w-5" />
                Home
              </Button>

              {/* Games Collapsible */}
              {isHomePage && (
                <>
                  <Collapsible open={gamesOpen} onOpenChange={setGamesOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between gap-3 h-12"
                      >
                        <span className="flex items-center gap-3">
                          <Gamepad2 className="h-5 w-5" />
                          Games
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            gamesOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 space-y-1">
                      {games.map((game) => (
                        <Button
                          key={game.name}
                          variant="ghost"
                          className="w-full justify-start gap-3 h-10"
                          onClick={() => handleNavClick(game.href)}
                        >
                          <span>{game.icon}</span>
                          {game.name}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {navItems.slice(1).map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleNavClick(item.href)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Button>
                  ))}
                </>
              )}

              {/* Divider */}
              <div className="border-t border-border my-4" />

              {/* Auth Section */}
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                      <User className="h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                        <Settings className="h-5 w-5" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 mt-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full h-12">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full h-12 glow-primary">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
