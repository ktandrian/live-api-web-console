"use server";

import { detectIntent } from "@/lib/dialogflow-cx";

export async function sendQuery(query: string) {
  try {
    const result = await detectIntent({
      query: {
        content: query,
        type: "text",
      },
      projectId: "kentandrian-dialogflow",
      location: "asia-southeast1",
      agentId: "de52b0b6-7c22-4fb2-a606-0d2f84f2487a",
      sessionId: "de52b0b6-7c22-4fb2-a606-0d2f84f2487a",
    });
    console.log("sendQuery:", result);
    return {
      success: true,
      payload: result.agentResponses,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      payload: [
        "Sorry, I don't have the answer right now.",
        "Is there anything else I can help you with?",
      ],
    };
  }
}
