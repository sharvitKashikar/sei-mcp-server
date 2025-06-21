import { VoyageAIClient } from "voyageai";

export const createEmbedder = (apiKey: string) => {
  return new VoyageAIClient({ apiKey });
};

export const generateEmbedding = async (
  client: VoyageAIClient,
  input: string[],
  options: {
    model?: string;
    inputType?: "query" | "document";
  } = {}
) => {
  return await client.embed({
    input,
    inputType: options.inputType || "query",
    model: options.model || "voyage-3-large",
  });
};
