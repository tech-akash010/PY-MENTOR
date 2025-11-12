import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { MiniQuest } from "./MiniQuest";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  onQuestSubmit?: (solution: string) => void;
  isQuestLoading?: boolean;
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

export const ChatMessage = ({ role, content, onQuestSubmit, isQuestLoading }: ChatMessageProps) => {
  const isUser = role === "user";
  const progressData = !isUser ? parseProgressBar(content) : null;
  
  // Parse mini quest
  const questMatch = content.match(/\*\*Mini Quest 🧩:\*\*\s*(.+?)(?=\n\n|\*\*|$)/s);
  const hasMiniQuest = !!questMatch;
  const questText = questMatch ? questMatch[1].trim() : "";
  
  // Remove quest from display content
  let displayContent = progressData ? progressData.before + progressData.after : content;
  if (questMatch) {
    displayContent = displayContent.replace(/\*\*Mini Quest 🧩:\*\*\s*.+?(?=\n\n|\*\*|$)/s, "");
  }

  const hasCompletion = content.includes("🎉") && content.includes("100% Complete");

  return (
    <div
      className={cn(
        "flex gap-3 sm:gap-4 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isUser ? "bg-background" : "bg-card",
        hasCompletion && "bg-gradient-to-br from-accent/10 to-primary/10"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-accent"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-3 sm:space-y-4 overflow-hidden">
        <div className="font-semibold text-sm sm:text-base text-foreground">
          {isUser ? "You" : "Python Tutor"}
        </div>
        
        {progressData && (
          <Card className={cn(
            "p-3 sm:p-4 border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5",
            "animate-in slide-in-from-left duration-500"
          )}>
            <ProgressBar 
              percentage={progressData.progress} 
              label="Your Progress"
            />
          </Card>
        )}

        <div className="prose prose-sm max-w-none text-foreground text-sm sm:text-base">
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
        
        {hasMiniQuest && onQuestSubmit && (
          <MiniQuest 
            questText={questText}
            onSubmit={onQuestSubmit}
            isLoading={isQuestLoading}
          />
        )}
      </div>
    </div>
  );
};
