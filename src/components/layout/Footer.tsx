import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="font-display text-xs font-bold text-primary-foreground">S</span>
            </div>
            <span className="font-display text-sm font-bold tracking-wider text-primary">
              SkyServer
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <a
              href="https://discord.gg/skyserver"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Discord
              <ExternalLink className="h-3 w-3" />
            </a>
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
