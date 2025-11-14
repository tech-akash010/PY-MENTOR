import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TopicHeader } from "@/components/TopicHeader";
import { SessionStats } from "@/components/SessionStats";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Index = () => {
  const [topic, setTopic] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [questLoading, setQuestLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    topicsCovered: 0,
    questsCompleted: 0,
    masteryLevel: 0,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Track session statistics
  useEffect(() => {
    const updateStats = () => {
      const allContent = messages.map(m => m.content).join(" ");
      const questsCompleted = (allContent.match(/Mini Quest 🧩:/g) || []).length;
      const hasCompletion = allContent.includes("100% Complete");
      
      setSessionStats({
        topicsCovered: topic ? 1 : 0,
        questsCompleted,
        masteryLevel: hasCompletion ? 100 : Math.min(messages.length * 10, 95),
      });
    };
    
    updateStats();
  }, [messages, topic]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setShowStats(false);
    const welcomeMessage: Message = {
      role: "assistant",
      content: `Perfect! Let's dive into **${selectedTopic}**. 🎯\n\n**Progress:** █▒▒▒▒▒▒▒▒▒ 10% Complete\n\nI'll guide you through this topic with clear explanations, examples, Mini Quests, and Memory Checkpoints. Feel free to ask questions at any time.\n\nWould you like me to:\n1. Start with the fundamentals\n2. See a code example right away\n3. Focus on a specific aspect\n\nWhat would you prefer?`,
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    
    // If no topic is set yet, use the message as the topic
    if (!topic) {
      setTopic(content);
      setMessages([userMessage]);
    } else {
      setMessages((prev) => [...prev, userMessage]);
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/python-tutor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            topic: topic || content,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: errorData.error || "Please try again in a moment.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (response.status === 402) {
          toast({
            title: "Credits Depleted",
            description: errorData.error || "Please add credits to continue learning.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = "";

      // Add an empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;

          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e);
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split("\n");
        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;
          
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Failed to parse remaining buffer:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      // Remove the empty assistant message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTopic = () => {
    setTopic("");
    setMessages([]);
    setShowStats(false);
    setSessionStats({ topicsCovered: 0, questsCompleted: 0, masteryLevel: 0 });
  };

  const handleQuestSubmit = async (solution: string) => {
    setQuestLoading(true);
    const submissionMessage = `Here's my solution to the Mini Quest:\n\n\`\`\`python\n${solution}\n\`\`\`\n\nPlease evaluate my code and provide feedback.`;
    await handleSendMessage(submissionMessage);
    setQuestLoading(false);
  };

  if (!topic) {
    return (
      <div className="flex flex-col h-screen">
        <WelcomeScreen onTopicSelect={handleTopicSelect} />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        <FloatingActionButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <TopicHeader topic={topic} onClearTopic={handleClearTopic} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Session Stats Toggle */}
          {messages.length > 3 && (
            <div className="sticky top-0 z-10 p-3 sm:p-4 bg-background/95 backdrop-blur-sm border-b border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="w-full text-xs sm:text-sm"
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {showStats ? "Hide" : "Show"} Session Progress
              </Button>
            </div>
          )}

          {/* Session Stats Display */}
          {showStats && (
            <div className="p-4 sm:p-6 animate-in slide-in-from-top duration-500">
              <SessionStats
                topicsCovered={sessionStats.topicsCovered}
                questsCompleted={sessionStats.questsCompleted}
                masteryLevel={sessionStats.masteryLevel}
              />
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              role={message.role} 
              content={message.content}
              onQuestSubmit={message.role === "assistant" ? handleQuestSubmit : undefined}
              isQuestLoading={questLoading}
            />
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-card">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent flex items-center justify-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm sm:text-base text-foreground mb-1 sm:mb-2">Python Tutor</div>
                <div className="text-xs sm:text-base text-muted-foreground">Thinking...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      <FloatingActionButton />
    </div>
  );
};

export default Index;
