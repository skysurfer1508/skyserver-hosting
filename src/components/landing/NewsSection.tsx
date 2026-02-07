import { NewsFeed } from '@/components/NewsFeed';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { motion } from 'framer-motion';

export function NewsSection() {
  const { data: announcements } = useAnnouncements(3);

  // Don't show section if no announcements
  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 border-b border-border/50">
      <div className="container">
        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <NewsFeed limit={3} maxHeight="400px" />
        </motion.div>
      </div>
    </section>
  );
}
