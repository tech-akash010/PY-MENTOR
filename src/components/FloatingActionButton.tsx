import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FloatingActionButton = () => {
  return (
    <Button
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-secondary text-secondary-foreground shadow-lg animate-pulse-glow hover:scale-110 transition-all duration-300 z-50"
      aria-label="Open chat"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};
