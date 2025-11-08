import { Card } from "@/components/ui/card";
import { BookOpen, Trophy, Target } from "lucide-react";

interface SessionStatsProps {
  topicsCovered: number;
  questsCompleted: number;
  masteryLevel: number;
}

export const SessionStats = ({ topicsCovered, questsCompleted, masteryLevel }: SessionStatsProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-accent" />
        Session Summary
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{topicsCovered}</div>
          <div className="text-xs text-muted-foreground">Topics Covered</div>
        </div>
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <div className="text-2xl font-bold text-foreground">{questsCompleted}</div>
          <div className="text-xs text-muted-foreground">Quests Done</div>
        </div>
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10">
            <Trophy className="w-6 h-6 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{masteryLevel}%</div>
          <div className="text-xs text-muted-foreground">Mastery</div>
        </div>
      </div>
    </Card>
  );
};
