import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Building, Mail, Globe } from 'lucide-react';
import { DISCORD_INVITE_URL } from '@/config/constants';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Imprint() {
  usePageTitle('Imprint - SkyServer');
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/10 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Imprint</h1>
            <p className="mt-2 text-muted-foreground">Legal information and contact details</p>
          </div>

          {/* Content Cards */}
          <div className="space-y-6">
            {/* Company Information */}
            <Card className="gaming-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Service Provider
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p className="font-semibold text-foreground">SkyServer</p>
                <p>A private, non-commercial game server hosting service</p>
                <p>Based in Switzerland</p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="gaming-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>For support inquiries, please use our Discord server.</p>
                <p>
                  <span className="text-foreground font-medium">Discord:</span>{' '}
                  <a 
                    href={DISCORD_INVITE_URL}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Join our Discord
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="gaming-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Liability for Content</h4>
                  <p>
                    The content of our pages has been created with the utmost care. However, we cannot 
                    guarantee the accuracy, completeness, or timeliness of the content. As a service 
                    provider, we are responsible for our own content on these pages under general laws.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Liability for Links</h4>
                  <p>
                    Our website contains links to external third-party websites over whose content we 
                    have no influence. Therefore, we cannot accept any liability for this external content. 
                    The respective provider or operator of the pages is always responsible for the content 
                    of the linked pages.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Copyright</h4>
                  <p>
                    The content and works created by the site operators on these pages are subject to 
                    copyright law. Duplication, processing, distribution, or any form of commercialization 
                    of such material beyond the scope of the copyright law requires the prior written 
                    consent of its respective author or creator.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
