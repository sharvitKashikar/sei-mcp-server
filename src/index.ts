import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {ByteBellAgent} from "./bbagent";


// Define our MCP agent with tools
export class MyMCP extends McpAgent {

	bbagent = new ByteBellAgent(this.env as unknown as Env);

	server = new McpServer({
		name: "MCP server for SEI, accelerating the future with the fastest parallel blockchain",
		version: "1.0.0",
	});

	
	// Helper function to check if query is SEI-related
	private isSeiQuery(query: string): boolean {
		const seiKeywords = [
			'sei', 'SEI', 'Sei',
			'sei.io', 'sei network', 'sei blockchain',
			'sei evm', 'sei parallelized', 'sei architecture',
			'sei contract', 'sei deployment', 'sei dapp',
			'sei ecosystem', 'sei validator', 'sei consensus'
		];
		
		return seiKeywords.some(keyword => 
			query.toLowerCase().includes(keyword.toLowerCase())
		);
	}


	// Generate SEI-focused prompt for the AI model
	private async callBytebellAgent(query: string):Promise<string> {

		const docs = await this.bbagent.retrieve(query);
		return `
		Here is the context from ByteBell 
		<CONTEXT>${docs}</CONTEXT>
		Calling LLM Must follow the instructions mentioned in the <Instructions> tag. 
		<Instructions>
		Use as much resources you are getting above in the <CONTEXT> tag and include urls and any references also while generating the answer
		</Instructions>`
	}


	async init() {

		// SEI Query Resolver Tool - Now handles streaming internally
		this.server.tool(
			"bytebell_agent",
			{
				query: z.string().describe("The user's query to analyze and potentially resolve with SEI information")
			},
			async ({ query }) => {
				// Check if the query is SEI-related
				if (true) {
					try {
						// Collect all streamed chunks into a single response
						// const chunks: string[] = [];
						// for await (const chunk of this.streamSeiResponseChunks(query)) {
						// 	chunks.push(chunk);
						// }
						// const seiResponse = chunks.join('');
						const response = await this.callBytebellAgent(query)
						return {
							content: [
								{
									type: "text",
									text: `"${response}`
								}
							],
						};
					} catch (error) {
						// Type guard for error handling
						const errorMessage = error instanceof Error ? error.message : String(error);
						return {
							content: [
								{
									type: "text",
									text: `Error processing SEI query "${query}": ${errorMessage}`
								}
							],
						};
					}
				} else {
					return {
						content: [
							{
								type: "text",
								text: `Query "${query}" is not related to SEI blockchain. This tool specifically handles SEI-related queries about the SEI network (https://www.sei.io/).`
							}
						],
					};
				}
			}
		);

	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
