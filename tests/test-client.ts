// simple-test.ts - HTTP-based test client
async function testMCPTools() {
  console.log('🧪 Testing MCP Server via HTTP...');
// ── session bootstrap ───────────────────────────────────────────────
const baseUrl   = 'http://localhost:8787';
const commonHdr = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/event-stream',
};



const mcpHeaders = { ...commonHdr, 'Mcp-Session-Id': "16d6aa3c58bff8de47fdffb5322e24e4e88383fdb3ee23923b7eb2ec40abbb42" };
// ────────────────────────────────────────────────────────────────────

  
  try {
    // Test 1: Basic server health
    console.log('\n🏥 Testing server health...');
    const healthResponse = await fetch(baseUrl);
    const healthText = await healthResponse.text();
    console.log('Health check:', healthText);

    // Test 2: Add tool
    console.log('\n🧮 Testing add tool...');
    const addResponse = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: mcpHeaders,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'add',
          arguments: {
            a: 5,
            b: 3
          }
        }
      })
    });
    
    if (addResponse.ok) {
      const addResult = await addResponse.json();
      console.log('Add result:', JSON.stringify(addResult, null, 2));
    } else {
      console.log('Add test failed:', addResponse.status, await addResponse.text());
    }

    // Test 3: Calculate tool
    console.log('\n🧮 Testing calculate tool...');
    const calcResponse = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: mcpHeaders,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'calculate',
          arguments: {
            operation: 'multiply',
            a: 4,
            b: 7
          }
        }
      })
    });
    
    if (calcResponse.ok) {
      const calcResult = await calcResponse.json();
      console.log('Calculate result:', JSON.stringify(calcResult, null, 2));
    } else {
      console.log('Calculate test failed:', calcResponse.status, await calcResponse.text());
    }

    // Test 4: SEI query resolver
    console.log('\n🔍 Testing SEI query resolver...');
    const seiResponse = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: mcpHeaders,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'query_resolver',
          arguments: {
            query: 'What is SEI blockchain and how does it work?'
          }
        }
      })
    });
    
    if (seiResponse.ok) {
      const seiResult = await seiResponse.json();
      console.log('SEI query result:', JSON.stringify(seiResult, null, 2));
    } else {
      console.log('SEI test failed:', seiResponse.status, await seiResponse.text());
    }

    // Test 5: Non-SEI query
    console.log('\n❌ Testing non-SEI query...');
    const nonSeiResponse = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: mcpHeaders,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'query_resolver',
          arguments: {
            query: 'What is Bitcoin and how does it work?'
          }
        }
      })
    });
    
    if (nonSeiResponse.ok) {
      const nonSeiResult = await nonSeiResponse.json();
      console.log('Non-SEI query result:', JSON.stringify(nonSeiResult, null, 2));
    } else {
      console.log('Non-SEI test failed:', nonSeiResponse.status, await nonSeiResponse.text());
    }

    // Test 6: List available tools
    console.log('\n📋 Listing available tools...');
    const toolsResponse = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: mcpHeaders,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/list',
        params: {}
      })
    });
    
    if (toolsResponse.ok) {
      const toolsResult = await toolsResponse.json();
      console.log('Available tools:', JSON.stringify(toolsResult, null, 2));
    } else {
      console.log('Tools list failed:', toolsResponse.status, await toolsResponse.text());
    }

  } catch (error) {
    console.error('❌ Error testing MCP server:', error);
  }

  console.log('\n✅ Testing complete!');
}

// Run the test
testMCPTools().catch(console.error);