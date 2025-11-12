import { Button } from "@/components/ui/button";
import { X, RefreshCw } from "lucide-react";

interface TopicHeaderProps {
  topic: string;
  onClearTopic: () => void;
}

export const TopicHeader = ({ topic, onClearTopic }: TopicHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-primary/95 backdrop-blur-sm border-b border-primary-foreground/10 shadow-lg">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-primary-foreground/70 font-medium">Current Topic</div>
            <div className="text-sm sm:text-lg font-semibold text-primary-foreground truncate">{topic}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearTopic}
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10 flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
        >
          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">Change Topic</span>
        </Button>
      </div>
    </div>
  );
};
