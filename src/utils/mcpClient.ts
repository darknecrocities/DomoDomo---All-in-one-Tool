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

  constructor() {
    // Proactively connect to the server
    this.connect();
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

  public getTools(): MCPTool[] {
    return this.tools;
  }

  public async connect(): Promise<boolean> {
    if (this.isConnected) return true;

    try {
      this.disconnect();
      console.log('🔌 Connecting to local MCP server at http://localhost:3001/sse...');
      
      const sseUri = `${this.baseUri}/sse`;
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
          console.log('✅ Captured MCP message POST URL:', this.postUrl);
        });

        // Listen for messages from the SSE stream
        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
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
          } catch (err) {
            console.error('Error parsing SSE message:', err);
          }
        };

        this.eventSource.onopen = async () => {
          console.log('✅ SSE Stream connection opened. Initiating handshake...');
          
          // Wait a brief moment to ensure postUrl is received
          let retryCount = 0;
          while (!this.postUrl && retryCount < 10) {
            await new Promise(r => setTimeout(r, 100));
            retryCount++;
          }

          if (!this.postUrl) {
            console.error('❌ Failed to capture POST endpoint from SSE connection.');
            this.disconnect();
            if (!isResolved) {
              isResolved = true;
              resolve(false);
            }
            return;
          }

          try {
            // 1. Send initialize request
            const initResult = await this.sendRequest('initialize', {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'domodomo-client', version: '1.0.0' }
            });

            console.log('🤝 Handshake step 1: initialize success', initResult);

            // 2. Send initialized notification
            await this.sendNotification('notifications/initialized');
            console.log('🤝 Handshake step 2: initialized notification sent');

            // 3. Query list of tools
            const toolsResult = await this.sendRequest('tools/list', {});
            this.tools = toolsResult.tools || [];
            console.log(`🛠️ Connected to Domo MCP. Loaded ${this.tools.length} tools:`, this.tools);

            this.isConnected = true;
            this.notifyListeners();
            if (!isResolved) {
              isResolved = true;
              resolve(true);
            }
          } catch (err) {
            console.error('❌ Handshake failed:', err);
            this.disconnect();
            if (!isResolved) {
              isResolved = true;
              resolve(false);
            }
          }
        };

        this.eventSource.onerror = (err) => {
          console.warn('⚠️ MCP EventSource encountered an error:', err);
          this.disconnect();
          if (!isResolved) {
            isResolved = true;
            resolve(false);
          }
        };
      });
    } catch (e) {
      console.warn('❌ Failed to connect to MCP server:', e);
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
    this.isConnected = false;
    this.tools = [];
    this.pendingRequests.forEach(({ reject }) => reject(new Error('MCP Disconnected')));
    this.pendingRequests.clear();
    this.notifyListeners();
  }

  public async callTool(name: string, args: Record<string, any>): Promise<any> {
    if (!this.isConnected || !this.postUrl) {
      throw new Error('MCP Client is offline. Cannot execute tool.');
    }
    
    console.log(`📦 Calling MCP Tool "${name}" with args:`, args);
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

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      fetch(this.postUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((err) => {
        this.pendingRequests.delete(id);
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

    await fetch(this.postUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn('Failed to send MCP notification:', err);
    });
  }
}

export const mcpClient = new DomoMCPClient();
