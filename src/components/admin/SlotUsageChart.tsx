import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SlotUsageChartProps {
  used: number;
  total: number;
  percentage: number;
  className?: string;
}

export function SlotUsageChart({ used, total, percentage, className }: SlotUsageChartProps) {
  // Calculate the stroke-dasharray for circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 70) return 'text-warning';
    return 'text-primary';
  };

  return (
    <Card className={cn("gaming-card border-border/50", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative h-24 w-24 flex-shrink-0">
            <svg
              className="h-24 w-24 -rotate-90 transform"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/30"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={cn("transition-all duration-500", getColor())}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-xl font-bold", getColor())}>
                {percentage}%
              </span>
            </div>
          </div>

          {/* Label */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Slot Usage</p>
            <p className="text-2xl font-bold text-foreground">
              {used} / {total}
            </p>
            <p className="text-xs text-muted-foreground">
              {total - used} slots available
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
