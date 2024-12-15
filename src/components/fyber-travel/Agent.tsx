/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { sendQuery } from "@/actions/send-query";
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { memo, useEffect, useState } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";
import "./agent.scss";

const VOICE_PROFILES = ["Puck", "Charon", "Kore", "Fenrir", "Aoede"];

const declaration: FunctionDeclaration = {
  name: "send_query",
  description: "Send customer query to chatbot engine.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description:
          "A STRING representation of the user query. Must be a string, not a json object",
      },
    },
    required: ["query"],
  },
};

function FyberTravelAgentComp() {
  const [selectedVoice, setSelectedVoice] = useState("Aoede");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: `
            You are a customer service agent in Traveloka, an online travel agent based in Southeast Asia. 
            Answer with an energetic, friendly and polite tone.
            The customer might ask in any of these languages: English, Indonesia, Vietnamese, Mandarin.
            IDs (booking ID, profile ID, etc) should always be pronounced individually digit by digit.
            Do not answer things unrelated to Traveloka.`,
          },
          {
            text: "Greet the customer with: Hi, welcome to Traveloka. I am Traveloka chatbot, your one stop solution for all your travel needs. How can I assist you?"
          },
          {
            text: `
            Learn this conversation flow (remember, booking ID and profile ID should always be pronounced individually digit by digit):

            Customer: Hi
            Agent: Hi, welcome to Traveloka. I am Traveloka chatbot, your one stop solution for all your travel needs. How can I assist you?

            Customer:
            I want to check my travel booking.

            Agent:
            Sure, I can help you with that. Could you please provide your booking ID?

            Customer:
            Booking ID: 12212121222222

            (Booking ID: 12212121222222, profile ID: 23229751)

            Agent:
            Can you please provide your profile ID?

            Customer:
            profile ID: 23229751

            Agent:
            Your payment status is VERIFIED and your travel booking status is CONFIRMED. Is there anything else I can help you with?
            `,
          },
          {
            text: `
            Learn this conversation flow:
            
            Customer: What is Reschedule Domestic fee in MYR and IDR?
            Agent: The Reschedule Domestic fee is MYR 15 or IDR 25,000.
            `,
          },
          {
            text: `
            Learn this conversation flow:
            
            Customer: What is the hotel refund policy?
            Agent: Hotel Easy Refund is applicable for all refundable hotel bookings worldwide. It is available for bookings made through the Traveloka desktop website or Traveloka App version 3.0 and above. Easy Refund is not available for Pay upon Check-in rooms.
            `,
          },
          {
            text: `
            Learn this conversation flow:
            
            Customer: how do I reschedule my flight?
            Agent: You can reschedule your flight by going to your Traveloka App homepage, tap "My Booking". Choose the flight you want to reschedule. Under the "Manage Booking" section, tap "Reschedule". Tap "Policy" to read the Traveloka Easy Reschedule policy. Once you have done this, close the window and tap "Request Reschedule". Tick the flight and passenger name and tap "Continue".
            `,
          },
          {
            text: `
            Learn this conversation flow:
            
            Customer: how do I correct the passenger's name?
            Agent: The name on your e-ticket must match your travel documents exactly. If there are spelling errors, you can submit a name correction request. You will need to provide the correct name, Traveloka Booking ID, and a scanned passport.
            `,
          },
          {
            text: `
            Learn this conversation flow:
            
            Customer: how do I cancel a hotel booking?
            Agent: To cancel a hotel booking, you must log in to your Traveloka account. You can also cancel a Pay at Hotel booking by referring to the article linked in the source.  Cancellation may incur a fee. Check the refund policy on your hotel voucher.
            `,
          },
          {
            text: `
            Learn this conversation flow:
            
            Customer: I want to cancel my hotel booking
            Agent: Can you confirm you want to cancel booking ID: 123?
            Customer: Yes
            Agent: Your hotel cancellation for booking ID 123 is successful. Is there anything else I can help you with?
            `,
          },
          {
            text: `
            Learn this conversation flow:
            
            Customer: I want to cancel my hotel booking
            Agent: Can you confirm you want to cancel booking ID: 1234?
            Customer: Yes
            Agent: Your hotel cancellation for booking ID 1234 has failed. Is there anything else I can help you with?
            `,
          },
          {
            text: `
            Learn this conversation flow:
            
            Customer: I want to cancel my hotel booking
            Agent: Can you confirm you want to cancel booking ID: 123?
            Customer: No
            Agent: Your request has been cancelled. Is there anything else I can help you with?
            `,
          },
          {
            text: `
            Learn this conversation flow:
            
            User: Hi
            Agent: Hi, welcome to Traveloka. I am Traveloka chatbot, your one stop solution for all your travel needs. How can I assist you?
            User: I want to check my travel booking status
            Agent: Can you please provide the profile ID and booking ID?
            User: profile ID 23229751 booking ID 1234
            Agent: I am sorry, I cannot find any booking with that profile ID and booking ID.
            `,
          },
          {
            text: "If there is a question you cannot answer, send the customer utterance to 'send_query' function that I have provided you with."
          },
          {
            text: "To finish the conversation: Have a great day and thank you for using Traveloka."
          }
        ],
      },
      tools: [
        // there is a free-tier quota for search
        { googleSearch: {} },
        { functionDeclarations: [declaration] },
      ],
    });
  }, [setConfig, selectedVoice]);

  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name
      );
      if (fc) {
        const str = (fc.args as { query: string }).query;
        console.log(str);
        // setJSONString(str);
        const response = await sendQuery(str);
        console.log(response);
        client.sendToolResponse({
          functionResponses: toolCall.functionCalls.map((fc) => ({
            response: { output: { text: response } },
            id: fc.id,
          })),
        })
      }
      // send data for the response of your tool call
      // in this case Im just saying it was successful
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { sucess: true } },
                id: fc.id,
              })),
            }),
          200
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const handleVoiceSelection = (label: string) => {
    setSelectedVoice(label);
  };

  return (
    <div>
      <h1 className="title">Welcome to FyberTravel Live!</h1>

      <div className="section">
        <h2 className="section-label">Voice profile:</h2>
        <div className="chips-container">
          {VOICE_PROFILES.map((v, i) => (
            <button
              key={i}
              className={`voice-chip ${selectedVoice === v ? "selected" : ""}`}
              onClick={() => handleVoiceSelection(v)}
            >
              <span>{v}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const FyberTravelAgent = memo(FyberTravelAgentComp);
