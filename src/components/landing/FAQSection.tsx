import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Is this really 100% free?',
    answer:
      'Yes. This is a non-profit student project funded by educational grants and personal contributions. No credit card required, no hidden fees, no premium tiers. The service is completely free.',
  },
  {
    question: 'Can I play 24/7?',
    answer:
      'Servers are online 24/7. However, to conserve resources and reduce energy consumption, servers with 0 players for 48 hours go into "Sleep Mode". They wake up instantly when someone tries to connect.',
  },
  {
    question: 'Can I upload my own world?',
    answer:
      'Yes! You have full SFTP and Web File Manager access. You can easily upload your existing single-player worlds, custom maps, or download your server backups at any time.',
  },
  {
    question: 'Can I install Mods or Plugins?',
    answer:
      'Absolutely. Unlike other free hosts, we give you full file access. You can install Fabric, Forge, Paper, or custom modpacks by simply uploading the files to your server.',
  },
  {
    question: 'How long until my server is approved?',
    answer:
      'Most requests are reviewed within 24-48 hours. We manually review each request to ensure fair usage and prevent abuse. You\'ll receive a notification once your server is ready.',
  },
  {
    question: 'What happens if my server is rejected?',
    answer:
      'If your request is rejected, you can submit a new one. Common reasons for rejection include duplicate requests or incomplete information. Join our Discord for support if you need help.',
  },
  {
    question: 'Are there any usage limits?',
    answer:
      'Each user can have one active server at a time. Servers come with reasonable resource limits suitable for small to medium-sized communities. For larger needs, consider self-hosting.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Absolutely. We use secure authentication and data storage, with servers hosted in a Swiss data center with high privacy standards. Your data is encrypted and backed up regularly.',
  },
  {
    question: 'How can I support the project?',
    answer:
      'The best way to support us is by spreading the word! Share SkyServer with your friends, join our Discord community, and provide feedback to help us improve.',
  },
];

export function FAQSection() {
  const [headerRef, isHeaderVisible] = useScrollReveal<HTMLDivElement>();
  const [accordionRef, isAccordionVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  return (
    <section id="faq" className="py-20 bg-card/30">
      <div className="container">
        <div 
          ref={headerRef}
          className={cn(
            "text-center mb-12 reveal-on-scroll",
            isHeaderVisible && "is-visible"
          )}
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers. If you can't find what you're looking for, join our Discord!
          </p>
        </div>

        <div 
          ref={accordionRef}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "reveal-on-scroll",
                  isAccordionVisible && "is-visible"
                )}
                style={{ transitionDelay: isAccordionVisible ? `${index * 80}ms` : '0ms' }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="gaming-card border-border/50 rounded-lg px-6 data-[state=open]:border-primary/50"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
