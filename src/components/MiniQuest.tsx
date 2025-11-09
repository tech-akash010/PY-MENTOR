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
    <Card className="mt-4 p-4 bg-accent/5 border-accent/20">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-accent/10">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">Mini Quest 🧩</h3>
          <p className="text-sm text-muted-foreground">{questText}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="# Write your Python code here..."
            className="min-h-[150px] font-mono text-sm bg-background"
            disabled={isLoading}
          />
          <Code className="absolute top-3 right-3 w-4 h-4 text-muted-foreground" />
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!solution.trim() || isLoading}
          className="w-full"
          size="sm"
        >
          <Send className="w-4 h-4 mr-2" />
          {isLoading ? "Evaluating..." : "Submit Solution"}
        </Button>
      </div>
    </Card>
  );
};
