import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Send, Sparkles, Copy, Smile } from "lucide-react";

interface AssistantResponse {
  response: string;
  emojiSuggestions: string[];
  assistantType: string;
  timestamp: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emojiSuggestions?: string[];
}

interface CopywritingAssistantProps {
  businessId: number;
  onCopySelect?: (text: string) => void;
}

export default function CopywritingAssistant({ businessId, onCopySelect }: CopywritingAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: "Hey there! 👋 I'm your playful copywriting buddy! Whether you need help brainstorming headlines, polishing your messaging, or just want some creative inspiration, I'm here to help make your words shine! ✨ What can we work on together?",
      timestamp: new Date().toISOString(),
      emojiSuggestions: ['✨', '🎉', '💡', '🚀', '💪', '👏', '🌟', '🔥', '💯', '🎯']
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const { toast } = useToast();

  const assistantMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/content/copywriting-assistant", {
        businessId,
        prompt,
        assistantType: "playful"
      });
      return response.json();
    },
    onSuccess: (data: AssistantResponse) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
        emojiSuggestions: data.emojiSuggestions
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error("Error getting assistant response:", error);
      toast({
        title: "Assistant Unavailable",
        description: "Your copywriting assistant is taking a break. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    assistantMutation.mutate(currentInput);
    setCurrentInput("");
  };

  const handleEmojiClick = (emoji: string) => {
    setCurrentInput(prev => prev + emoji);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied! 📋",
      description: "Text copied to your clipboard.",
    });
    if (onCopySelect) {
      onCopySelect(text);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col border-2 border-purple-200 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <CardHeader className="border-b bg-white/50 dark:bg-gray-900/50">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Bot className="h-4 w-4 text-white" />
          </div>
          Copywriting Assistant
        </CardTitle>
        <CardDescription>
          Your creative writing companion with emoji magic ✨
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white rounded-l-lg rounded-tr-lg'
                  : 'bg-white dark:bg-gray-800 border rounded-r-lg rounded-tl-lg shadow-sm'
              } p-3`}>
                {message.type === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      Assistant
                    </span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                {message.type === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(message.content)}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    {message.emojiSuggestions && message.emojiSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {message.emojiSuggestions.slice(0, 6).map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-sm hover:bg-purple-100 dark:hover:bg-purple-900 rounded px-1 transition-colors"
                            title="Add to your message"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {assistantMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border rounded-r-lg rounded-tl-lg shadow-sm p-3 max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-pulse">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                  </div>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    Assistant is typing...
                  </span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-white/50 dark:bg-gray-900/50 p-4">
          <div className="flex gap-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about copywriting! Need help with headlines, CTAs, or just creative ideas? 💭"
              className="min-h-[60px] resize-none"
              disabled={assistantMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || assistantMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Emoji Suggestions */}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Smile className="h-3 w-3" />
            <span className="text-xs">Quick emojis:</span>
            {['✨', '🎉', '💡', '🚀', '💪', '🔥'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="hover:bg-purple-100 dark:hover:bg-purple-900 rounded px-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}