import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Code, Send, Sparkles } from "lucide-react";

interface MiniQuestProps {
  questText: string;
  onSubmit: (solution: string) => void;
  isLoading?: boolean;
}

export const MiniQuest = ({ questText, onSubmit, isLoading }: MiniQuestProps) => {
  const [solution, setSolution] = useState("");

  const handleSubmit = () => {
    if (solution.trim()) {
      onSubmit(solution.trim());
      setSolution("");
    }
  };

  return (
    <Card className="mt-3 sm:mt-4 p-3 sm:p-4 bg-accent/5 border-accent/20">
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10 flex-shrink-0">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">Mini Quest 🧩</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{questText}</p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <div className="relative">
          <Textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="# Write your Python code here..."
            className="min-h-[120px] sm:min-h-[150px] font-mono text-xs sm:text-sm bg-background"
            disabled={isLoading}
          />
          <Code className="absolute top-2 sm:top-3 right-2 sm:right-3 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!solution.trim() || isLoading}
          className="w-full text-xs sm:text-sm"
          size="sm"
        >
          <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          {isLoading ? "Evaluating..." : "Submit Solution"}
        </Button>
      </div>
    </Card>
  );
};
