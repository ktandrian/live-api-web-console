import { v3beta1 } from "@google-cloud/dialogflow-cx";
import { randomUUID } from "crypto";
import type { DetectIntentQuery } from "@/types/dialogflow-cx";

const cxClient = new v3beta1.SessionsClient({
  apiEndpoint: "asia-southeast1-dialogflow.googleapis.com",
});

async function getQueryText(query: DetectIntentQuery) {
  switch (query.type) {
    case "text":
      return query.content;
  }
}

export async function detectIntent({
  query,
  projectId,
  location,
  agentId,
  sessionId,
}: {
  query: DetectIntentQuery;
  projectId: string;
  location: string;
  agentId: string;
  sessionId?: string;
}) {
  if (!sessionId) sessionId = randomUUID();
  const sessionPath = cxClient.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );

  const queryText = await getQueryText(query);
  const [response] = await cxClient.detectIntent({
    session: sessionPath,
    queryInput: {
      text: { text: queryText },
      languageCode: "en-US",
    },
    // outputAudioConfig
  });
  // console.log(response.outputAudio)
  console.log(`User Query: ${response.queryResult?.transcript}`);
  for (const message of response.queryResult?.responseMessages || []) {
    if (message.text) {
      console.log(`Agent Response: ${message.text.text}`);
    }
  }
  if (response.queryResult?.match?.intent) {
    console.log(
      `Matched Intent: ${response.queryResult.match.intent.displayName}`
    );
  }
  console.log(
    `Current Page: ${response.queryResult?.currentPage?.displayName}`
  );
  return {
    sessionId,
    agentResponses: response.queryResult?.responseMessages?.map(
      (message) => message.text?.text?.[0]
    ),
  };
}
