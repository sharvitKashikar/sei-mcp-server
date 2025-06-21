import {
  Pinecone,
  type RecordMetadata,
  QueryOptions,
  Index,
} from "@pinecone-database/pinecone";

export const createPineconeClient = (apiKey: string) => {
  return new Pinecone({ apiKey });
};

export const getIndex = <T extends RecordMetadata = RecordMetadata>(
  client: Pinecone,
  indexName: string
) => {
  return client.Index<T>(indexName);
};

export const getNamespaceIndex = <T extends RecordMetadata = RecordMetadata>(
  client: Pinecone,
  indexName: string,
  namespace: string
) => {
  return getIndex<T>(client, indexName).namespace(namespace);
};

export const queryIndex = async <T extends BaseMetadata = BaseMetadata>(
  client: Pinecone,
  indexName: string,
  namespace: string,
  options: QueryOptions,
  index?: Index<T>
) => {
  if (index) {
    return await index.query(options);
  }
  return await getNamespaceIndex<T>(client, indexName, namespace).query(
    options
  );
};

export const getSparseVectors = async (
  client: Pinecone,
  query: string,
  model: string = "pinecone-sparse-english-v0"
) => {
  const response = await client.inference.embed(model, [query], {
    inputType: "query",
  });
  return response.data;
};

type BaseMetadata<T extends RecordMetadata = RecordMetadata> = {
  id: string;
  text: string;
  node_id?: string;
} & T;
