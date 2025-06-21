# sei-mcp-server

## Wrangler Configuration with OpenRouter API Key

### 1. Local Development Configuration

#### Create `wrangler.toml`
```toml
name = "your-worker-name"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
# Public environment variables (non-sensitive)
ENVIRONMENT = "development"
API_BASE_URL = "https://openrouter.ai/api/v1"

# For local development, you can also define secrets here
# but they'll be overridden by .dev.vars
```

#### Create `.dev.vars` for Local Secrets
```bash
# .dev.vars (for local development only)
OPENROUTER_API_KEY=your_actual_api_key_here
```

#### Add to `.gitignore`
```gitignore
.dev.vars
```

### 2. Production Secrets Management

#### Set Production Secret
```bash
# Set the secret for production
npx wrangler secret put OPENROUTER_API_KEY

# You'll be prompted to enter the key value
```

#### Or set it directly
```bash
echo "your_actual_api_key" | npx wrangler secret put OPENROUTER_API_KEY
```

### 3. Using in Your Worker Code

```javascript
export default {
  async fetch(request, env, ctx) {
    // Access the API key from environment
    const apiKey = env.OPENROUTER_API_KEY;
    
    // Use it in your API calls
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // your request body
      })
    });
    
    return response;
  }
};
```

### 4. Environment-Specific Configuration

#### For different environments
```toml
# wrangler.toml
[env.staging]
vars = { ENVIRONMENT = "staging" }

[env.production]
vars = { ENVIRONMENT = "production" }
```

#### Deploy to specific environments
```bash
# Deploy to staging
npx wrangler deploy --env staging

# Set secrets for specific environments
npx wrangler secret put OPENROUTER_API_KEY --env production
```

### 5. Alternative: Using Environment Variables

```bash
# List current secrets
npx wrangler secret list

# Delete a secret
npx wrangler secret delete OPENROUTER_API_KEY
```

[]
➜  sei-mcp-server git:(main) ✗ npx wrangler secret put OPENROUTER_API_KEY --env production

(node:23941) ExperimentalWarning: CommonJS module /Users/sauravverma/.nvm/versions/node/v23.3.0/lib/node_modules/npm/node_modules/debug/src/node.js is loading ES Module /Users/sauravverma/.nvm/versions/node/v23.3.0/lib/node_modules/npm/node_modules/supports-color/index.js using require().
Support for loading ES Module in require() is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)

 ⛅️ wrangler 4.20.5
───────────────────
✔ Enter a secret value: … *************************************************************************
🌀 Creating the secret for the Worker "sei-mcp-server"
✨ Success! Uploaded secret OPENROUTER_API_KEY
➜  sei-mcp-server git:(main) ✗ npx wrangler secret list --env production

(node:23975) ExperimentalWarning: CommonJS module /Users/sauravverma/.nvm/versions/node/v23.3.0/lib/node_modules/npm/node_modules/debug/src/node.js is loading ES Module /Users/sauravverma/.nvm/versions/node/v23.3.0/lib/node_modules/npm/node_modules/supports-color/index.js using require().
Support for loading ES Module in require() is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
[
  {
    "name": "OPENROUTER_API_KEY",
    "type": "secret_text"
  }
]
➜  sei-mcp-server git:(main) ✗ npx wrangler deploy --env production