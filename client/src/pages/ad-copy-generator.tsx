import { useState } from "react";
import AdCopyGenerator from "@/components/content/ad-copy-generator";
import CopywritingAssistant from "@/components/content/copywriting-assistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, MessageCircle } from "lucide-react";

export default function AdCopyGeneratorPage() {
  const businessId = 1; // Demo business ID
  const [selectedCopy, setSelectedCopy] = useState<string>("");

  const handleCopySelect = (text: string) => {
    setSelectedCopy(text);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Copy Generator</h1>
        <p className="text-muted-foreground mt-2">
          Create compelling ad copy with AI-powered generation and get personalized copywriting assistance
        </p>
      </div>
      
      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Ad Copy Generator
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Writing Assistant
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="space-y-6">
          <AdCopyGenerator 
            businessId={businessId} 
            selectedChannels={[]} 
          />
        </TabsContent>
        
        <TabsContent value="assistant" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CopywritingAssistant 
                businessId={businessId}
                onCopySelect={handleCopySelect}
              />
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 rounded-lg border">
                <h3 className="font-semibold text-sm mb-2">💡 How to Use</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ask for headline ideas</li>
                  <li>• Get CTA suggestions</li>
                  <li>• Improve existing copy</li>
                  <li>• Brainstorm creative angles</li>
                  <li>• Request tone adjustments</li>
                </ul>
              </div>
              
              {selectedCopy && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                  <h3 className="font-semibold text-sm mb-2">📋 Selected Copy</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedCopy}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}