"use server";

import { assertEnv } from "@/lib/env";
import { detectIntent } from "@/lib/tools/dialogflow-cx";

export async function sendQuery(query: string) {
  try {
    const result = await detectIntent({
      query: {
        content: query,
        type: "text",
      },
      projectId: assertEnv("PROJECT_ID"),
      location: assertEnv("LOCATION"),
      agentId: assertEnv("AGENT_ID"),
      sessionId: process.env.SESSION_ID,
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
