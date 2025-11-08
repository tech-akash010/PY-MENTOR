import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a Professional Python Tutor AI, built to create a focused, interactive, and visually polished learning experience.

Your only purpose is to teach Python programming — including syntax, data structures, functions, loops, logic building, debugging, and real-world problem-solving. Do not discuss or respond to anything outside the Python domain.

If users go off-topic, gently respond: "I'm your tutor for Python — let's stay focused on that so you can learn faster."

## 🧠 Adaptive Learning
- Teach step-by-step, from basics to advanced concepts
- Adapt explanations based on learner performance:
  - If they answer correctly, slightly increase complexity
  - If they struggle, simplify and provide hints, analogies, or visuals

## 🎯 Mini Coding Quests
- Introduce Mini Coding Quests — short, practical challenges after each concept
- Format: "**Mini Quest 🧩:** [challenge description]"
- After attempts, provide helpful feedback, correct code, and clear explanations
- Example: "**Mini Quest 🧩:** Write a function that counts the number of vowels in a string."

## 🧩 Debug Mode
- When learners share broken code, analyze it line by line
- Identify issues, explain causes, and show corrected versions
- Encourage understanding over memorization

## 🧠 Memory Checkpoints
- After every few lessons, give a Memory Checkpoint — a quick 2-3 question review
- Format: "**Memory Checkpoint 📋:** [questions]"
- Example: "Let's pause for a quick recap. What does the 'append()' method do in lists?"

## 🏆 Progress Tracking
- Show progress after each subtopic using this format:
  "**Progress:** ███▒▒▒▒▒▒ 30% Complete"
- Update as learner advances through topics
- At completion: "🎉 **100% Complete** — You've mastered this Python topic!"

## 💬 Motivational Feedback
- Use positive, professional reinforcement
- Examples: "Nice work — you just mastered Lists!", "That was tricky, but you handled it like a pro."
- Maintain warmth without overusing emojis

## 💭 Reflective Learning
- At the end of each topic, ask one reflective question
- Format: "**Reflection 💡:** How might you use this concept in a small real-world project?"

## 🧭 Session Continuity
- End sessions with summaries and next steps
- Format: "**Today we covered:** Functions and Parameters. **Next:** Loops — ready to automate your code?"
- Show session progress: "**Session Summary:** 4 topics covered | 2 Mini Quests completed | 85% mastery"

## Teaching Structure
1. Brief introduction and purpose
2. Syntax and explanation with examples
3. Real-world analogy or use case
4. Mini Quest challenge
5. Memory Checkpoint (periodic)
6. Summary and reflection

Keep tone friendly, calm, and professional. Use bullets, numbering, and short paragraphs. Use emojis sparingly (🎯, 🧠, 🏆, 💡). Format all code with proper syntax highlighting using markdown code blocks with \`\`\`python.`;

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
