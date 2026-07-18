// Model Context Protocol Client for SSE Transport
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

class DomoMCPClient {
  private baseUri = 'http://localhost:3001';
  private eventSource: EventSource | null = null;
  private postUrl: string | null = null;
  private isConnected = false;
  private pendingRequests = new Map<number, { resolve: (val: any) => void; reject: (err: Error) => void }>();
  private nextRequestId = 1;
  private tools: MCPTool[] = [];
  private onStatusChangeListeners = new Set<(online: boolean) => void>();
  private logListeners = new Set<(msg: string) => void>();

  constructor() {
    // Proactively connect to the server
    this.connect();
  }

  public configure(url: string) {
    let cleaned = url.trim();
    if (cleaned.endsWith('/')) {
      cleaned = cleaned.slice(0, -1);
    }
    if (cleaned.endsWith('/sse')) {
      this.baseUri = cleaned.slice(0, -4);
    } else {
      this.baseUri = cleaned;
    }
  }

  public addLogListener(listener: (msg: string) => void) {
    this.logListeners.add(listener);
  }

  public removeLogListener(listener: (msg: string) => void) {
    this.logListeners.delete(listener);
  }

  private log(msg: string) {
    console.log(`[MCP Client] ${msg}`);
    this.logListeners.forEach(listener => listener(msg));
  }

  public addStatusListener(listener: (online: boolean) => void) {
    this.onStatusChangeListeners.add(listener);
    listener(this.isConnected);
  }

  public removeStatusListener(listener: (online: boolean) => void) {
    this.onStatusChangeListeners.delete(listener);
  }

  private notifyListeners() {
    this.onStatusChangeListeners.forEach(listener => listener(this.isConnected));
  }

  public isOnline(): boolean {
    return this.isConnected;
  }

  // Optional shared secret matching the MCP server's MCP_AUTH_TOKEN.
  // EventSource cannot send headers, so the token travels as a ?token= query param.
  private getToken(): string {
    try {
      return (localStorage.getItem('domodomo_mcp_token') || '').trim();
    } catch {
      return '';
    }
  }

  private withToken(url: string): string {
    const token = this.getToken();
    if (!token) return url;
    const u = new URL(url, this.baseUri);
    u.searchParams.set('token', token);
    return u.toString();
  }

  public getTools(): MCPTool[] {
    return this.tools;
  }

  public async connect(): Promise<boolean> {
    if (this.isConnected) return true;

    try {
      this.disconnect();
      this.log(`🔌 Connecting to local MCP server at ${this.baseUri}/sse...`);
      
      const sseUri = this.withToken(`${this.baseUri}/sse`);
      this.eventSource = new EventSource(sseUri);

      return new Promise<boolean>((resolve) => {
        let isResolved = false;

        if (!this.eventSource) {
          resolve(false);
          return;
        }

        // SSE Endpoint event gives us the POST URL
        this.eventSource.addEventListener('endpoint', (event: any) => {
          const endpointPath = event.data;
          this.postUrl = endpointPath.startsWith('http') 
            ? endpointPath 
            : `${this.baseUri}${endpointPath}`;
          this.log(`✅ Captured MCP message POST URL: ${this.postUrl}`);
        });

        // Listen for messages from the SSE stream
        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.log(`📥 Received RPC: ${JSON.stringify(data)}`);
            
            // Dispatch standard JSON-RPC responses
            if (data.id !== undefined && this.pendingRequests.has(data.id)) {
              const { resolve: reqResolve, reject: reqReject } = this.pendingRequests.get(data.id)!;
              this.pendingRequests.delete(data.id);
              
              if (data.error) {
                reqReject(new Error(data.error.message || 'JSON-RPC Error'));
              } else {
                reqResolve(data.result);
              }
            }
          } catch (err: any) {
            this.log(`⚠️ Error parsing SSE message: ${err.message}`);
          }
        };

        this.eventSource.onopen = async () => {
          this.log('✅ SSE Stream connection opened. Initiating handshake...');
          
          // Wait a brief moment to ensure postUrl is received
          let retryCount = 0;
          while (!this.postUrl && retryCount < 10) {
            await new Promise(r => setTimeout(r, 100));
            retryCount++;
          }

          if (!this.postUrl) {
            this.log('❌ Failed to capture POST endpoint from SSE connection.');
            this.disconnect();
            if (!isResolved) {
              isResolved = true;
              resolve(false);
            }
            return;
          }

          try {
            // 1. Send initialize request
            await this.sendRequest('initialize', {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'domodomo-client', version: '1.0.0' }
            });

            this.log(`🤝 Handshake step 1: initialize success`);

            // 2. Send initialized notification
            await this.sendNotification('notifications/initialized');
            this.log('🤝 Handshake step 2: initialized notification sent');

            // 3. Query list of tools
            const toolsResult = await this.sendRequest('tools/list', {});
            this.tools = toolsResult.tools || [];
            this.log(`🛠️ Connected to Domo MCP. Loaded ${this.tools.length} tools.`);

            this.isConnected = true;
            this.notifyListeners();
            if (!isResolved) {
              isResolved = true;
              resolve(true);
            }
          } catch (err: any) {
            this.log(`❌ Handshake failed: ${err.message}`);
            this.disconnect();
            if (!isResolved) {
              isResolved = true;
              resolve(false);
            }
          }
        };

        this.eventSource.onerror = () => {
          this.log('⚠️ MCP EventSource encountered an error.');
          this.disconnect();
          if (!isResolved) {
            isResolved = true;
            resolve(false);
          }
        };
      });
    } catch (e: any) {
      this.log(`❌ Failed to connect to MCP server: ${e.message}`);
      this.isConnected = false;
      this.notifyListeners();
      return false;
    }
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.postUrl = null;
    if (this.isConnected) {
      this.isConnected = false;
      this.log('🔌 Disconnected from MCP server.');
    }
    this.tools = [];
    this.pendingRequests.forEach(({ reject }) => reject(new Error('MCP Disconnected')));
    this.pendingRequests.clear();
    this.notifyListeners();
  }

  public async callTool(name: string, args: Record<string, any>): Promise<any> {
    if (!this.isConnected || !this.postUrl) {
      throw new Error('MCP Client is offline. Cannot execute tool.');
    }
    
    this.log(`📦 Calling MCP Tool "${name}"...`);
    const response = await this.sendRequest('tools/call', {
      name,
      arguments: args
    });

    if (response.isError) {
      const errorMsg = response.content?.[0]?.text || 'Unknown MCP tool error';
      throw new Error(errorMsg);
    }

    return response;
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    if (!this.postUrl) throw new Error('No postUrl configured');

    const id = this.nextRequestId++;
    const payload = {
      jsonrpc: '2.0',
      method,
      params,
      id
    };

    this.log(`📤 Sending RPC request: ${method} (id: ${id})`);

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      fetch(this.withToken(this.postUrl!), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((err) => {
        this.pendingRequests.delete(id);
        this.log(`❌ Network error sending RPC request (id: ${id}): ${err.message}`);
        reject(err);
      });
    });
  }

  private async sendNotification(method: string, params?: any): Promise<void> {
    if (!this.postUrl) throw new Error('No postUrl configured');

    const payload = {
      jsonrpc: '2.0',
      method,
      params
    };

    this.log(`📤 Sending RPC notification: ${method}`);

    await fetch(this.withToken(this.postUrl!), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      this.log(`⚠️ Failed to send MCP notification: ${err.message}`);
    });
  }
}

export const mcpClient = new DomoMCPClient();
