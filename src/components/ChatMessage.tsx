import { User, Bot, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const parseProgressBar = (text: string): { before: string; progress: number; after: string } | null => {
  const progressMatch = text.match(/\*\*Progress:\*\*\s+(█+)(▒+)\s+(\d+)%\s+Complete/);
  if (progressMatch) {
    const filled = progressMatch[1].length;
    const empty = progressMatch[2].length;
    const total = filled + empty;
    const percentage = Math.round((filled / total) * 100);
    const [fullMatch] = progressMatch;
    const index = text.indexOf(fullMatch);
    
    return {
      before: text.substring(0, index),
      progress: percentage,
      after: text.substring(index + fullMatch.length),
    };
  }
  return null;
};

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";
  const progressData = !isUser ? parseProgressBar(content) : null;
  const displayContent = progressData ? progressData.before + progressData.after : content;

  // Check for special highlights
  const hasMiniQuest = content.includes("**Mini Quest 🧩:**");
  const hasMemoryCheckpoint = content.includes("**Memory Checkpoint 📋:**");
  const hasCompletion = content.includes("🎉") && content.includes("100% Complete");

  return (
    <div
      className={cn(
        "flex gap-4 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isUser ? "bg-background" : "bg-card",
        hasCompletion && "bg-gradient-to-br from-accent/10 to-primary/10"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-accent",
          hasCompletion && "bg-gradient-to-br from-accent to-primary animate-pulse"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : hasCompletion ? (
          <CheckCircle2 className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-accent-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-4 overflow-hidden">
        <div className="font-semibold text-foreground">
          {isUser ? "You" : "Python Tutor"}
        </div>
        
        {progressData && (
          <Card className={cn(
            "p-4 border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5",
            "animate-in slide-in-from-left duration-500"
          )}>
            <ProgressBar 
              percentage={progressData.progress} 
              label="Your Progress"
            />
          </Card>
        )}

        {hasMiniQuest && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Mini Quest Challenge</span>
          </div>
        )}

        <div className="prose prose-sm max-w-none text-foreground">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match;
                
                return !isInline ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg overflow-hidden my-4"
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="bg-code-bg text-code-text px-2 py-1 rounded text-sm"
                  >
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="text-foreground">{children}</li>,
              h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-foreground">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 text-foreground">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
