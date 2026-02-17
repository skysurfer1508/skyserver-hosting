import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { gameCategories } from '@/data/helpArticles';
import { usePageTitle } from '@/hooks/usePageTitle';

function renderAnswer(answer: string) {
  const lines = answer.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];
  const elements: React.ReactNode[] = [];

  const flush = (i: number) => {
    if (codeLines.length > 0) {
      elements.push(
        <pre key={`code-${i}`} className="my-3 rounded-lg bg-muted/50 border border-border p-4 overflow-x-auto text-sm font-mono text-foreground">
          {codeLines.join('\n')}
        </pre>
      );
      codeLines = [];
    }
  };

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flush(i);
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }
    if (!line.trim()) {
      elements.push(<br key={i} />);
      return;
    }

    // Render inline formatting
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g);
    const rendered = parts
      .filter((p) => p !== undefined)
      .map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={j} className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-sm">{part.slice(1, -1)}</code>;
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return <a key={j} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{linkMatch[1]}</a>;
        }
        return part;
      });

    elements.push(
      <p key={i} className="text-muted-foreground mb-1 leading-relaxed">
        {rendered}
      </p>
    );
  });

  flush(lines.length);
  return elements;
}

export default function Help() {
  usePageTitle('Help Center - SkyServer | Game Server Guides & Tutorials');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return gameCategories;
    const query = searchQuery.toLowerCase();
    return gameCategories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(query) ||
            q.answer.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.questions.length > 0);
  }, [searchQuery]);

  const defaultTab = filteredCategories.length > 0 ? filteredCategories[0].id : 'satisfactory';

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-primary glow-text-primary">SkyServer</span> Help Center
            </motion.h1>
            <motion.p
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Find answers to common server issues, organized by game.
            </motion.p>

            <motion.div
              className="mt-8 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-card border-border"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs + Accordion */}
      <section className="py-8 md:py-12">
        <div className="container max-w-4xl">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          ) : (
            <Tabs defaultValue={defaultTab} key={defaultTab}>
              <TabsList className="w-full flex flex-nowrap overflow-x-auto h-auto gap-1 bg-muted/50 p-1.5 rounded-lg scrollbar-hide">
                {filteredCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-2 text-sm"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{cat.label}</span>
                      <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5 data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground">
                        {cat.questions.length}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {filteredCategories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Accordion type="single" collapsible className="space-y-3">
                      {cat.questions.map((q, i) => (
                        <AccordionItem
                          key={i}
                          value={`q-${i}`}
                          className="border border-border rounded-lg px-5 bg-card/50 data-[state=open]:border-primary/30"
                        >
                          <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-4">
                            {q.question}
                          </AccordionTrigger>
                          <AccordionContent className="pb-5">
                            <div className="prose prose-invert max-w-none">
                              {renderAnswer(q.answer)}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </section>
    </Layout>
  );
}
