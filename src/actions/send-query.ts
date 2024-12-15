"use server";

import { detectIntent } from "@/lib/dialogflow-cx";

export async function sendQuery(query: string) {
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
  console.log('result', result);
  return result.agentResponses;
}
