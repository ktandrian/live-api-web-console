interface JsonifiedBuffer {
  data: number[];
  type: "Buffer";
}

export interface AgentsAutocareAPIResponse {
  sessionId: string;
  agentResponses: {
    text: string | undefined;
    speech: JsonifiedBuffer | undefined;
  }[];
}

export interface DetectIntentQuery {
  type: "text" | "audio";
  content: string;
}
