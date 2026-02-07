import { Link } from 'react-router-dom';
import { ExternalLink, Server, MessageCircle, HelpCircle } from 'lucide-react';
import { DISCORD_INVITE_URL } from '@/config/constants';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Server className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold tracking-wider text-primary">
              SkyServer
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#5865F2] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Join our Discord
              <ExternalLink className="h-3 w-3" />
            </a>
            <Link
              to="/help"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Help Center
            </Link>
            <Link
              to="/imprint"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Imprint
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SkyServer. Made with ❤️ in Switzerland.
          </p>
        </div>
      </div>
    </footer>
  );
}
