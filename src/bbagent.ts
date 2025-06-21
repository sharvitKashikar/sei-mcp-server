
import { MetaRetriever, BaseRetriever} from "./retrievers"; 
import {createEmbedder} from "./vector/embeddings";
import {createPineconeClient} from "./vector/pinecone";

// Store env reference for use in tools
// Define environment interface for Cloudflare Worker bindings
interface Env {
	OPENROUTER_API_KEY: string;
	YOUR_SITE_URL?: string;
	CLOUDFLARE_API_TOKEN?: string;
	CLOUDFLARE_ACCOUNT_ID?: string;
	PINECONE_API_KEY: string;
	VOYAGE_API_KEY: string
}

export class ByteBellAgent {

	private metaRetriever: MetaRetriever;
	private baseRetriever: BaseRetriever;
	private pineconeClient;
	private voyageAiClient;
	private config: any;
	private env: Env;
	constructor(env: any){
		this.env = env as unknown as Env
		this.config =  {
			"indexName": "bytebell-prod-v2",
			"namespaces": {
				"meta": "sei_meta",
				"base": "sei"
			}
		};

		this.pineconeClient = createPineconeClient(this.env.PINECONE_API_KEY)
		this.voyageAiClient = createEmbedder(this.env.VOYAGE_API_KEY)
		this.metaRetriever = new MetaRetriever(
			this.pineconeClient,
			this.config.indexName,
			this.voyageAiClient
		  );
		  this.baseRetriever = new BaseRetriever(
			this.pineconeClient,
			this.config.indexName,
			this.voyageAiClient
		  );
	};

	private async createEnhancedQuery(
		originalQuery: string,
		metaResults: any[],
		keywords: string[]
	  ): Promise<string> {
		try {
		  if (metaResults.length === 0) return originalQuery;
	
		  // Format meta context for LLM analysis
		  const metaContext = metaResults
			.map((r)=>{return r.content}
			)
			.join("\n");
		// console.log(metaContext)
		console.log("-----------------------_META CONTEXT -------------------------------");
		  const prompt = `You are a search query optimizer. Analyze the meta context to enhance the original query for better document retrieval.
	
			Original Query: "${originalQuery}"
			
			Meta Context Found:
			${metaContext}
			
			Extracted Keywords: ${keywords.slice(0, 5).join(", ")}
			
			Task: Create an enhanced search query that:
			1. Preserves the original intent
			2. Incorporates relevant meta context
			3. Uses domain-specific terminology found in meta
			4. Optimizes for semantic similarity search
			
			Respond with ONLY the enhanced query, no explanation:`;
			const ai_response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.env.OPENROUTER_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'google/gemini-2.0-flash-lite-001',
					messages: [
						{
							role: 'user',
							content: prompt
						}
					],
					stream: false,
					max_tokens: 30000,
					temperature: 0.1
				})
			});

		  const response = await ai_response.json();
		//   const enhancedQuery = JSON.stringify(response);
		//  	console.log(`LLM enhanced query: "${enhancedQuery}"`);
		  const enhancedQuery = response.choices[0].message.content;
		 	console.log(`LLM enhanced query: "${enhancedQuery}"`);

		console.log("-----------------------ENHANCE QUERY ENDED -------------------------------");
		  return enhancedQuery;
		} catch (error) {
		  console.log(`LLM enhancement failed, using fallback: ${error}`);
	
		  // Fallback to simple concatenation
		  const metaContext = metaResults
			.slice(0, 3)
			.map((result) => result.metadata?.metaType || "")
			.filter((title) => title.length > 0)
			.join(" ");
	
		  const topKeywords = keywords.slice(0, 5).join(" ");
		  return `${originalQuery} ${metaContext} ${topKeywords}`.trim();
		}
	  }
		

	async retrieve(
		input: string,
		options?: any
	  ): Promise<string> {
		const query = input;
		console.log(`:mag: Combined search for: "${query.slice(0, 70)}..."`);
		try {
		  // Phase 1: Meta search for high-level context
		  const metaResults = await this.metaRetriever.search({
			query,
			namespace: this.config.namespaces.meta,
			topK: 20,
			filter: {
				"datasource": {
					"$in": ["PDF", "WEBSITE", "CUSTOM"]
				} 
			},
			scoreThreshold: this.config.scoreThreshold || 0.1,
		  });

		  console.log(`:books: Meta searchmetaChunks ${metaResults.results} results`);
		  const metaChunks = metaResults.results.map((r)=> {
			return r.content
		  })
		  const eQuery = await this.createEnhancedQuery(query, metaResults.results, []);

		  console.log("---------------------------------------------------------------------\n---------\n");

		  console.log(`:bar_chart: Meta search found ${metaResults.results.length} results`);
		  // Phase 2: Base search for detailed content
		  const baseResults = await this.baseRetriever.search({
			query: eQuery,
			namespace: this.config.namespaces.base,
			topK: 20,
			filter: {
				"datasource": {
					"$in": ["PDF", "WEBSITE", "CUSTOM"]
				} 
			},
			scoreThreshold: this.config.scoreThreshold || 0.1,
		  });
		  console.log(`:books: Base search found ${baseResults.results} results`);
		  const chunks = baseResults.results.map((r)=> {
			return r.content
		  })

		  return chunks.join("\n")
		} catch (error) {
		  console.error(":x: Combined retrieval failed:", error);
		  return "Error retrieving information from knowledge base.";
		}
	  }

}

// const main = async () =>{
// 	const agent = new ByteBellAgent();
// 	await agent.retrieve("How sei EVM works");
	
// }

// main()