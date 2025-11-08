import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  label?: string;
  className?: string;
}

export const ProgressBar = ({ percentage, label, className }: ProgressBarProps) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-foreground">{label}</span>
          <span className="text-accent font-semibold">{clampedPercentage}%</span>
        </div>
      )}
      <div className="relative h-3 bg-secondary/30 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clampedPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
