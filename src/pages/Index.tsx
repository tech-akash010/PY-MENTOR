import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TopicHeader } from "@/components/TopicHeader";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Index = () => {
  const [topic, setTopic] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    const welcomeMessage: Message = {
      role: "assistant",
      content: `Perfect! Let's dive into **${selectedTopic}**.\n\nI'll guide you through this topic with clear explanations, examples, and practice questions. Feel free to ask questions at any time.\n\nWould you like me to:\n1. Start with the fundamentals\n2. See a code example right away\n3. Focus on a specific aspect\n\nWhat would you prefer?`,
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
  };

  if (!topic) {
    return <WelcomeScreen onTopicSelect={handleTopicSelect} />;
  }

  return (
    <div className="flex flex-col h-screen">
      <TopicHeader topic={topic} onClearTopic={handleClearTopic} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-4 p-6 bg-card">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-2">Python Tutor</div>
                <div className="text-muted-foreground">Thinking...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default Index;
