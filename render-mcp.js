#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

const API_KEY = process.env.RENDER_API_KEY;
const BASE_URL = 'https://api.render.com/v1';

if (!API_KEY) {
  console.error('ERROR: RENDER_API_KEY environment variable not set');
  process.exit(1);
}

// MCP Tool definitions
const tools = [
  {
    name: 'list_services',
    description: 'List all services in your Render account',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_service',
    description: 'Get details about a specific service',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: {
          type: 'string',
          description: 'The ID of the service'
        }
      },
      required: ['serviceId']
    }
  },
  {
    name: 'get_deployment',
    description: 'Get details about a specific deployment',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: {
          type: 'string',
          description: 'The ID of the service'
        },
        deploymentId: {
          type: 'string',
          description: 'The ID of the deployment'
        }
      },
      required: ['serviceId', 'deploymentId']
    }
  },
  {
    name: 'list_deployments',
    description: 'List recent deployments for a service',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: {
          type: 'string',
          description: 'The ID of the service'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of deployments to return (default: 10)'
        }
      },
      required: ['serviceId']
    }
  },
  {
    name: 'trigger_deploy',
    description: 'Trigger a new deployment for a service',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: {
          type: 'string',
          description: 'The ID of the service to deploy'
        }
      },
      required: ['serviceId']
    }
  }
];

// Render API request helper
function renderRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.render.com',
      path: `/v1${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Tool implementations
async function listServices() {
  const result = await renderRequest('GET', '/services');
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result.data, null, 2)
    }]
  };
}

async function getService(serviceId) {
  const result = await renderRequest('GET', `/services/${serviceId}`);
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result.data, null, 2)
    }]
  };
}

async function getDeployment(serviceId, deploymentId) {
  const result = await renderRequest('GET', `/services/${serviceId}/deployments/${deploymentId}`);
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result.data, null, 2)
    }]
  };
}

async function listDeployments(serviceId, limit = 10) {
  const result = await renderRequest('GET', `/services/${serviceId}/deployments?limit=${limit}`);
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result.data, null, 2)
    }]
  };
}

async function triggerDeploy(serviceId) {
  const result = await renderRequest('POST', `/services/${serviceId}/deploys`);
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result.data, null, 2)
    }]
  };
}

// MCP Protocol handler
async function handleRequest(request) {
  switch (request.method) {
    case 'initialize':
      return {
        protocolVersion: '2024-11-05',
        capabilities: {},
        serverInfo: {
          name: 'render-mcp',
          version: '1.0.0'
        }
      };

    case 'tools/list':
      return {
        tools: tools
      };

    case 'tools/call':
      const { name, arguments: args } = request.params;
      switch (name) {
        case 'list_services':
          return await listServices();
        case 'get_service':
          return await getService(args.serviceId);
        case 'get_deployment':
          return await getDeployment(args.serviceId, args.deploymentId);
        case 'list_deployments':
          return await listDeployments(args.serviceId, args.limit);
        case 'trigger_deploy':
          return await triggerDeploy(args.serviceId);
        default:
          return { error: `Unknown tool: ${name}` };
      }

    default:
      return { error: `Unknown method: ${request.method}` };
  }
}

// JSONRPC 2.0 stdin/stdout server
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let requestId = 1;

  rl.on('line', async (line) => {
    try {
      const request = JSON.parse(line);
      const response = {
        jsonrpc: '2.0',
        id: request.id || requestId++,
        result: await handleRequest(request)
      };
      console.log(JSON.stringify(response));
    } catch (error) {
      const errorResponse = {
        jsonrpc: '2.0',
        id: requestId++,
        error: {
          code: -32700,
          message: 'Parse error',
          data: error.message
        }
      };
      console.log(JSON.stringify(errorResponse));
    }
  });

  rl.on('close', () => process.exit(0));
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
