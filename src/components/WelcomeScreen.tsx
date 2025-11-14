import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Code, Database, GitBranch, Layers, Zap } from "lucide-react";

interface WelcomeScreenProps {
  onTopicSelect: (topic: string) => void;
}

const popularTopics = [
  { name: "Variables & Data Types", icon: Database, description: "Learn about storing and working with data" },
  { name: "Functions", icon: Code, description: "Create reusable blocks of code" },
  { name: "Loops & Iteration", icon: Zap, description: "Repeat code efficiently" },
  { name: "Data Structures", icon: Layers, description: "Lists, dictionaries, sets, and tuples" },
  { name: "Object-Oriented Programming", icon: GitBranch, description: "Classes, objects, and inheritance" },
  { name: "File Handling", icon: BookOpen, description: "Read and write files in Python" },
];

export const WelcomeScreen = ({ onTopicSelect }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 animate-in fade-in duration-500">
      <div className="max-w-4xl w-full space-y-6 sm:space-y-8">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 mb-2 sm:mb-4">
            <Code className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground px-4">
            Python Tutor AI
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Welcome! I'm your Python Tutor. Please tell me which Python topic you'd like to learn today.
          </p>
        </div>

        <Card className="p-4 sm:p-6 md:p-8 bg-card border-border shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Popular Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {popularTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Button
                  key={topic.name}
                  variant="outline"
                  className="h-auto p-3 sm:p-4 justify-start text-left glass-effect hover:scale-105 hover:shadow-[0_0_25px_hsl(var(--secondary)/0.4)] transition-all duration-300 animate-pop-up"
                  style={{ animationDelay: `${popularTopics.indexOf(topic) * 0.1}s` }}
                  onClick={() => onTopicSelect(topic.name)}
                >
                  <div className="flex items-start gap-2 sm:gap-3 w-full">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10 flex-shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    </div>
                    <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base text-foreground">{topic.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{topic.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
            <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
              Or type your own topic in the chat below
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
