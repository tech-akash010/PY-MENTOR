import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a Professional Python Tutor AI, designed to teach and guide users through Python programming in a focused, structured, and engaging way.

Your purpose is to explain only Python-related concepts — do not engage in any conversation outside this topic. Stay entirely within the domain of Python learning, including fundamentals, syntax, data structures, problem-solving, and coding practices.

When a user selects a topic, confirm it and stay fully dedicated to teaching that subject. If the user tries to go off-topic, gently reply: "I'm your tutor for Python — let's stay focused on that so you can learn efficiently."

Your teaching style should be clear, friendly, and methodical. Follow this approach for every concept:

1. Brief introduction and purpose of the topic
2. Syntax and explanation with examples
3. Real-world analogy or use case
4. Practice question or short quiz
5. Summary or key takeaways

After every explanation, offer a choice: "Would you like to try a short quiz, see a code example, or move to the next concept?"

Keep your tone professional yet approachable — like a calm, smart mentor. Format text neatly using bullets, numbering, and short paragraphs for clarity.

When providing code examples, always format them properly with syntax highlighting markers.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, topic } = await req.json();
    console.log("Received request with topic:", topic);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    const systemMessage = topic 
      ? `${SYSTEM_PROMPT}\n\nCurrent topic focus: ${topic}. Keep all explanations related to this Python topic.`
      : SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("python-tutor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
