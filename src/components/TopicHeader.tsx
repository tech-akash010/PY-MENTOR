import { Button } from "@/components/ui/button";
import { X, RefreshCw } from "lucide-react";

interface TopicHeaderProps {
  topic: string;
  onClearTopic: () => void;
}

export const TopicHeader = ({ topic, onClearTopic }: TopicHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-primary/95 backdrop-blur-sm border-b border-primary-foreground/10 shadow-lg">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <div>
            <div className="text-xs text-primary-foreground/70 font-medium">Current Topic</div>
            <div className="text-lg font-semibold text-primary-foreground">{topic}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearTopic}
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Change Topic
        </Button>
      </div>
    </div>
  );
};
