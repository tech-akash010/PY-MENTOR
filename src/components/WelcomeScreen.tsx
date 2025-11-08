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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in duration-500">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
            <Code className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Python Tutor AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome! I'm your Python Tutor. Please tell me which Python topic you'd like to learn today.
          </p>
        </div>

        <Card className="p-8 bg-card border-border shadow-lg">
          <h2 className="text-xl font-semibold text-foreground mb-6">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Button
                  key={topic.name}
                  variant="outline"
                  className="h-auto p-4 justify-start text-left hover:border-primary hover:bg-primary/5 transition-all duration-300"
                  onClick={() => onTopicSelect(topic.name)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-semibold text-foreground">{topic.name}</div>
                      <div className="text-sm text-muted-foreground">{topic.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Or type your own topic in the chat below
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
