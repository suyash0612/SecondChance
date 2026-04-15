# Render MCP Server Setup

Your Render MCP server is now configured and ready to use! 🚀

## What's Configured

- **MCP Server**: `.mcp.json` - Defines the Render MCP server
- **Server Implementation**: `render-mcp.js` - Node.js script that wraps Render API
- **Settings**: `.claude/settings.json` - Enables the server and stores your API key
- **API Key**: Securely stored in environment variables

## Available Commands

You can now use the following tools through Claude Code:

### `list_services`
List all services in your Render account.
```
List all my Render services
```

### `get_service`
Get details about a specific service.
```
Get details for service: srv_abc123
```

### `list_deployments`
List recent deployments for a service.
```
List deployments for service: srv_abc123 (limit: 10)
```

### `get_deployment`
Get details about a specific deployment.
```
Get deployment abc123 for service: srv_abc123
```

### `trigger_deploy`
Trigger a new deployment for a service.
```
Deploy service: srv_abc123
```

## How It Works

1. Claude Code reads the `.mcp.json` configuration
2. The Render MCP server (`render-mcp.js`) starts as a subprocess
3. Your Render API key is injected from `.claude/settings.json`
4. You can now ask Claude to deploy, check status, and manage services

## Example Usage

```
"Can you list my Render services and check the status of the backend deployment?"
"Deploy the second-opinion-backend service"
"What was the status of the last deployment?"
```

## Security Notes

- ✅ Your API key is stored in `.claude/settings.json` (project-level)
- ✅ `.claude/settings.local.json` is in `.gitignore` for extra protection
- ⚠️ Never commit `.claude/settings.json` if it contains secrets
- 💡 Consider moving the API key to `.claude/settings.local.json` for additional safety:
  ```json
  {
    "enabledMcpjsonServers": ["render"],
    "env": {
      "RENDER_API_KEY": "your-key-here"
    }
  }
  ```

## Troubleshooting

### Server won't start
- Ensure Node.js is installed: `node --version`
- Check that `render-mcp.js` is executable
- Verify `RENDER_API_KEY` is set in settings

### API calls fail
- Confirm your Render API key is valid
- Check Render API status at https://render.com/status
- Verify the service ID exists in your Render account

### Next Steps

1. Try asking Claude: "List my Render services"
2. Use Claude to check deployment status
3. Trigger deployments through Claude commands
4. Integrate with your workflow!

## API Documentation

Full Render API docs: https://render.com/docs/api-reference
