import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Zap,
  Bot,
  Cpu,
  Database,
  Code,
  MessageSquare,
  Download,
  Plus,
  Play,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Sparkles,
  Layers,
  Share2,
  CheckCircle,
  Settings,
  Send,
  Terminal,
  Search,
  FileText,
  Upload,
  Lock,
  Shield,
  Globe,
  Mail,
  Workflow,
  ExternalLink,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronRight,
  Info,
  Server
} from 'lucide-react';
import { aiService } from '../../../utils/aiService';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';

export interface FlowNodePort {
  id: string;
  name: string;
  type: 'input' | 'output' | 'model' | 'memory' | 'tool' | 'vector_store' | 'embedding';
  label?: string;
}

export interface FlowNode {
  id: string;
  type: 'trigger' | 'document_upload' | 'agent' | 'llm' | 'memory' | 'vector_store' | 'tool' | 'mcp_tool' | 'formatter' | 'script' | 'webhook' | 'export';
  title: string;
  subtitle?: string;
  category: string;
  iconName: string;
  color: string;
  x: number;
  y: number;
  status: 'idle' | 'running' | 'completed' | 'error' | 'deactivated';
  config: Record<string, any>;
  inputs: FlowNodePort[];
  outputs: FlowNodePort[];
  lastOutput?: any;
  lastInput?: any;
  executionTimeMs?: number;
}

export interface FlowConnection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
  label?: string;
}

export interface WorkflowPreset {
  id: string;
  name: string;
  tag: string;
  description: string;
  active: boolean;
  nodes: FlowNode[];
  connections: FlowConnection[];
}

// ── MCP SERVER CATALOG ─────────────────────────────────────────────────────
const MCP_SERVER_CATALOG = {
  gmail: {
    label: 'Gmail',
    icon: 'Mail',
    color: '#EA4335',
    description: 'Send, read, and search Gmail messages via the Gmail MCP server.',
    credentialFields: [
      { key: 'gmail_token', label: 'Gmail OAuth Token', placeholder: 'ya29.a0AfH6SMBxxx...', type: 'password', hint: 'Get from Google Cloud Console → OAuth2 Credentials' },
      { key: 'email_address', label: 'Email Address', placeholder: 'you@gmail.com', type: 'text', hint: 'Your connected Gmail address' }
    ],
    tools: ['send_email', 'list_inbox', 'search_emails', 'get_message', 'create_draft'],
    setupSteps: [
      'Go to console.cloud.google.com and create a new project',
      'Enable the Gmail API under APIs & Services',
      'Create OAuth 2.0 credentials (Web Application type)',
      'Copy the access token and paste it above',
      'Run: npx @modelcontextprotocol/server-gmail'
    ],
    docsUrl: 'https://modelcontextprotocol.io/docs'
  },
  github: {
    label: 'GitHub',
    icon: 'Code',
    color: '#E8E8E8',
    description: 'Create issues, manage PRs, and push files to GitHub repositories.',
    credentialFields: [
      { key: 'github_token', label: 'GitHub Personal Access Token', placeholder: 'ghp_xxxxxxxxxxxxxxxxx...', type: 'password', hint: 'Settings → Developer settings → Personal access tokens → Fine-grained' },
      { key: 'repo_name', label: 'Repository (owner/repo)', placeholder: 'myuser/my-repo', type: 'text', hint: 'owner/repo format, e.g. darknecrocities/DomoDomo' }
    ],
    tools: ['create_issue', 'list_prs', 'push_file', 'get_repo_info', 'create_branch', 'merge_pr'],
    setupSteps: [
      'Go to github.com → Settings → Developer settings → Personal access tokens',
      'Click "Generate new token (fine-grained)"',
      'Select your target repository and enable read/write permissions',
      'Copy the token and paste above',
      'Run: npx @modelcontextprotocol/server-github'
    ],
    docsUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens'
  },
  slack: {
    label: 'Slack',
    icon: 'MessageSquare',
    color: '#4A154B',
    description: 'Send messages, list channels, and interact with Slack workspaces.',
    credentialFields: [
      { key: 'slack_bot_token', label: 'Slack Bot Token', placeholder: 'xoxb-xxxxxxxxxx-xxxxxxxxxx...', type: 'password', hint: 'Create a Slack App at api.slack.com/apps, add Bot Token Scopes' },
      { key: 'channel', label: 'Default Channel', placeholder: '#general', type: 'text', hint: 'Channel to post messages to by default' }
    ],
    tools: ['send_message', 'list_channels', 'upload_file', 'post_reaction', 'list_members'],
    setupSteps: [
      'Go to api.slack.com/apps and click "Create New App"',
      'Under "OAuth & Permissions", add scopes: chat:write, channels:read, files:write',
      'Install the app to your workspace and copy the Bot User OAuth Token',
      'Invite the bot to the channel: /invite @your-bot',
      'Run: npx @modelcontextprotocol/server-slack'
    ],
    docsUrl: 'https://api.slack.com/authentication/token-types'
  },
  filesystem: {
    label: 'Filesystem',
    icon: 'FileText',
    color: '#D97706',
    description: 'Securely read and write local files within an allowed base path.',
    credentialFields: [
      { key: 'base_path', label: 'Allowed Base Path', placeholder: '/home/user/documents', type: 'text', hint: 'MCP server will sandbox all file operations within this path' }
    ],
    tools: ['read_file', 'write_file', 'list_directory', 'create_directory', 'delete_file', 'move_file'],
    setupSteps: [
      'Install the MCP filesystem server: npx @modelcontextprotocol/server-filesystem /your/path',
      'The server will only expose files within the specified base path',
      'No credentials needed — path restriction is the security boundary',
      'Connect your Agent node to this MCP Tool node to enable file operations',
      'Test with a read_file tool call in the chat console'
    ],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem'
  },
  postgres: {
    label: 'Postgres',
    icon: 'Database',
    color: '#336791',
    description: 'Query and mutate rows in a local or remote PostgreSQL database.',
    credentialFields: [
      { key: 'connection_string', label: 'Connection String', placeholder: 'postgresql://user:pass@localhost:5432/mydb', type: 'password', hint: 'Full postgres URI format' }
    ],
    tools: ['query', 'insert_row', 'update_row', 'delete_row', 'list_tables', 'describe_table'],
    setupSteps: [
      'Ensure PostgreSQL is running locally or remotely',
      'Format your connection string: postgresql://user:password@host:port/database',
      'Run: npx @modelcontextprotocol/server-postgres postgresql://...',
      'Your agent can now SELECT, INSERT, UPDATE via natural language',
      'Use read-only credentials for safety in production'
    ],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres'
  },
  huggingface: {
    label: 'HuggingFace',
    icon: 'Sparkles',
    color: '#FFD21E',
    description: 'Run inference and embeddings on HuggingFace hosted models.',
    credentialFields: [
      { key: 'hf_api_key', label: 'HuggingFace API Token', placeholder: 'hf_xxxxxxxxxxxxxxx...', type: 'password', hint: 'Get from huggingface.co/settings/tokens' }
    ],
    tools: ['run_inference', 'list_models', 'get_model_info', 'run_embedding', 'text_classification'],
    setupSteps: [
      'Create a HuggingFace account at huggingface.co',
      'Go to huggingface.co/settings/tokens and create a new token',
      'Select "Read" access for basic inference',
      'Paste the token above and save',
      'Run: npx @modelcontextprotocol/server-huggingface'
    ],
    docsUrl: 'https://huggingface.co/docs/api-inference'
  },
  custom: {
    label: 'Custom MCP Server',
    icon: 'Server',
    color: '#3C6B4D',
    description: 'Connect to any custom MCP-compatible HTTP server endpoint.',
    credentialFields: [
      { key: 'url', label: 'MCP Server URL', placeholder: 'http://localhost:3001/mcp', type: 'text', hint: 'HTTP or HTTPS URL of your MCP server' },
      { key: 'token', label: 'Auth Bearer Token (optional)', placeholder: 'Bearer eyJhbGc...', type: 'password', hint: 'Leave blank for unauthenticated servers' }
    ],
    tools: ['call_tool', 'list_tools', 'get_schema', 'ping'],
    setupSteps: [
      'Build or deploy any MCP-compatible HTTP server',
      'Implement the JSON-RPC 2.0 MCP protocol endpoints',
      'Enter the server URL above (e.g. http://localhost:3001/mcp)',
      'Add a bearer token if your server requires authentication',
      'Check modelcontextprotocol.io/docs for the full server SDK'
    ],
    docsUrl: 'https://modelcontextprotocol.io/docs'
  },
  // ─── 20 ADDITIONAL MCP SERVERS ───────────────────────────────────────────

  notion: { label: 'Notion', icon: 'FileText', color: '#FFFFFF', description: 'Read, create, and update Notion pages, databases, and blocks.', credentialFields: [{ key: 'notion_token', label: 'Notion Integration Token', placeholder: 'secret_xxxxxxxxxxxxxx...', type: 'password', hint: 'notion.so/my-integrations → New integration → copy token, then share page with it' }, { key: 'page_id', label: 'Root Page ID (optional)', placeholder: 'abc123def456...', type: 'text', hint: 'ID from Notion page URL — restricts MCP scope (optional)' }], tools: ['get_page', 'create_page', 'update_page', 'query_database', 'append_block', 'search_pages'], setupSteps: ['Go to notion.so/my-integrations → New integration', 'Copy the Internal Integration Token (starts with secret_)', 'Share a Notion page with integration via Page Share → Invite', 'Paste the token above', 'Run: npx @modelcontextprotocol/server-notion'], docsUrl: 'https://developers.notion.com/docs/authorization' },
  linear: { label: 'Linear', icon: 'Workflow', color: '#5E6AD2', description: 'Manage Linear issues, projects, cycles, and team workflows via GraphQL API.', credentialFields: [{ key: 'linear_api_key', label: 'Linear API Key', placeholder: 'lin_api_xxxxxxxxxxxxxx...', type: 'password', hint: 'Linear → Settings → API → Personal API Keys → Create Key' }], tools: ['create_issue', 'list_issues', 'update_issue', 'list_projects', 'list_teams', 'create_comment'], setupSteps: ['Open Linear → Settings → API', 'Personal API Keys → generate new key', 'Copy key (starts with lin_api_)', 'Paste above', 'Run: npx @modelcontextprotocol/server-linear'], docsUrl: 'https://developers.linear.app/docs/graphql/working-with-the-graphql-api' },
  discord: { label: 'Discord', icon: 'MessageSquare', color: '#5865F2', description: 'Send messages, manage channels, and interact with Discord servers via bot token.', credentialFields: [{ key: 'discord_bot_token', label: 'Discord Bot Token', placeholder: 'MTxxxxxx.Gyyyyy.zzzzzz...', type: 'password', hint: 'discord.com/developers/applications → Bot → Reset Token' }, { key: 'guild_id', label: 'Server Guild ID', placeholder: '123456789012345678', type: 'text', hint: 'Right-click server → Copy Server ID (enable Developer Mode in settings)' }], tools: ['send_message', 'list_channels', 'create_channel', 'get_members', 'pin_message', 'delete_message'], setupSteps: ['discord.com/developers/applications → New Application', 'Bot → enable Privileged Intents → Reset Token', 'OAuth2 → URL Generator → bot scope → invite to server', 'Enter token and guild ID above', 'Run: npx @modelcontextprotocol/server-discord'], docsUrl: 'https://discord.com/developers/docs/topics/oauth2' },
  twitter: { label: 'Twitter / X', icon: 'Globe', color: '#1DA1F2', description: 'Post tweets, search timeline, and read mentions via Twitter/X v2 API.', credentialFields: [{ key: 'twitter_bearer_token', label: 'Bearer Token', placeholder: 'AAAAAAAAAAAAAAAAAAA...', type: 'password', hint: 'developer.twitter.com → App → Keys & Tokens → Bearer Token' }, { key: 'twitter_api_key', label: 'API Key', placeholder: 'xxxxxxxxxxxxxxxxxxx', type: 'password', hint: 'developer.twitter.com → App → API Key and Secret' }, { key: 'twitter_api_secret', label: 'API Secret', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password', hint: 'Used for OAuth 1.0a signing — keep secret' }], tools: ['post_tweet', 'search_tweets', 'get_timeline', 'get_mentions', 'like_tweet', 'get_user_info'], setupSteps: ['Apply for Twitter Developer account at developer.twitter.com', 'Create Project + App → Keys & Tokens → generate tokens', 'Enable Read & Write permissions for posting tweets', 'Enter bearer token, API key, and secret above', 'Run: npx @modelcontextprotocol/server-twitter'], docsUrl: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0/bearer-tokens' },
  youtube: { label: 'YouTube', icon: 'Zap', color: '#FF0000', description: 'Search videos, get channel stats, manage playlists via YouTube Data API v3.', credentialFields: [{ key: 'youtube_api_key', label: 'YouTube Data API v3 Key', placeholder: 'AIzaSyxxxxxxxxxxxxxx...', type: 'password', hint: 'console.cloud.google.com → APIs & Services → Credentials → Create API Key → restrict to YouTube Data API v3' }], tools: ['search_videos', 'get_video_details', 'list_channel_videos', 'get_channel_stats', 'list_playlists', 'get_comments'], setupSteps: ['console.cloud.google.com → enable YouTube Data API v3', 'Credentials → Create API Key → restrict to YouTube Data API v3', 'Copy key above', 'Free tier: 10,000 units/day', 'Run: npx @modelcontextprotocol/server-youtube'], docsUrl: 'https://developers.google.com/youtube/v3/getting-started' },
  shopify: { label: 'Shopify', icon: 'Database', color: '#96BF48', description: 'Manage Shopify products, orders, customers, and inventory via Admin REST API.', credentialFields: [{ key: 'shopify_store', label: 'Store Domain', placeholder: 'mystore.myshopify.com', type: 'text', hint: 'Shopify subdomain without https://' }, { key: 'shopify_token', label: 'Admin API Access Token', placeholder: 'shpat_xxxxxxxxxxxxxx...', type: 'password', hint: 'Admin → Apps → Custom apps → Create app → Install → API credentials' }], tools: ['list_products', 'create_product', 'get_orders', 'update_order', 'list_customers', 'get_inventory'], setupSteps: ['Shopify Admin → Settings → Apps → Develop apps → Create app', 'Configure Admin API access scopes → Install app', 'Copy Admin API access token', 'Enter store domain and token above', 'Run: npx @modelcontextprotocol/server-shopify'], docsUrl: 'https://shopify.dev/docs/api/admin-rest' },
  stripe: { label: 'Stripe', icon: 'Layers', color: '#635BFF', description: 'Query payments, customers, invoices, subscriptions, and refunds via Stripe API.', credentialFields: [{ key: 'stripe_secret_key', label: 'Stripe Secret Key', placeholder: 'sk_live_xxxxxx... (sk_test_ for dev)', type: 'password', hint: 'dashboard.stripe.com → Developers → API Keys → Reveal secret key' }], tools: ['list_customers', 'get_customer', 'list_payments', 'create_payment', 'list_invoices', 'create_refund', 'list_subscriptions'], setupSteps: ['dashboard.stripe.com → Developers → API keys', 'Reveal and copy secret key (sk_live_ or sk_test_)', 'Use sk_test_ during development to avoid real charges', 'Enter key above', 'Run: npx @modelcontextprotocol/server-stripe'], docsUrl: 'https://stripe.com/docs/api/authentication' },
  mongodb: { label: 'MongoDB', icon: 'Database', color: '#47A248', description: 'Query, insert, update, and aggregate documents in MongoDB Atlas or local MongoDB.', credentialFields: [{ key: 'mongodb_uri', label: 'MongoDB Connection URI', placeholder: 'mongodb+srv://user:pass@cluster.mongodb.net/mydb', type: 'password', hint: 'Atlas: Clusters → Connect → Drivers → Copy connection string' }, { key: 'database_name', label: 'Database Name', placeholder: 'myDatabase', type: 'text', hint: 'Default database to query' }], tools: ['find_documents', 'insert_document', 'update_document', 'delete_document', 'aggregate', 'list_collections', 'create_index'], setupSteps: ['cloud.mongodb.com → free cluster → Connect → Drivers → copy URI', 'Local: mongod on localhost:27017', 'Format: mongodb+srv://user:pass@host/db', 'Set database name above', 'Run: npx @modelcontextprotocol/server-mongodb'], docsUrl: 'https://www.mongodb.com/docs/drivers/node/current/connection-guide/' },
  redis: { label: 'Redis', icon: 'Database', color: '#DC382D', description: 'Get, set, delete, and manage Redis keys, hashes, lists, sets, and pub/sub channels.', credentialFields: [{ key: 'redis_url', label: 'Redis URL', placeholder: 'redis://localhost:6379', type: 'password', hint: 'redis:// for standard, rediss:// for TLS. Auth: redis://:password@host:6379/0' }], tools: ['get', 'set', 'del', 'hget', 'hset', 'lpush', 'lrange', 'sadd', 'smembers', 'publish', 'keys', 'expire', 'ttl'], setupSteps: ['Local: brew install redis && redis-server', 'Cloud: redis.com → copy connection URL', 'Format: redis://localhost:6379', 'Paste URL above', 'Run: npx @modelcontextprotocol/server-redis'], docsUrl: 'https://redis.io/docs/connect/' },
  elasticsearch: { label: 'Elasticsearch', icon: 'Search', color: '#FEC514', description: 'Full-text search, index, and aggregate data in Elasticsearch clusters.', credentialFields: [{ key: 'es_url', label: 'Elasticsearch URL', placeholder: 'http://localhost:9200', type: 'text', hint: 'Local: http://localhost:9200. Cloud: https://yourcluster.es.io:443' }, { key: 'es_api_key', label: 'API Key (optional)', placeholder: 'base64encodedApiKey==', type: 'password', hint: 'Kibana → Stack Management → API Keys → Create. Blank for local dev' }], tools: ['search', 'index_document', 'get_document', 'delete_document', 'list_indices', 'create_index', 'bulk_index', 'aggregate'], setupSteps: ['Local: docker run -p 9200:9200 elasticsearch:8.11.0', 'Cloud: copy endpoint from Elastic Cloud deployment', 'Kibana → Stack Management → API Keys → Create', 'Enter URL and API key above', 'Run: npx @modelcontextprotocol/server-elasticsearch'], docsUrl: 'https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/getting-started-js.html' },
  airtable: { label: 'Airtable', icon: 'Layers', color: '#FFBF00', description: 'Read and write rows in Airtable bases and tables via the Airtable REST API.', credentialFields: [{ key: 'airtable_token', label: 'Personal Access Token', placeholder: 'patXXXXXXXX.XXXXXXXX...', type: 'password', hint: 'airtable.com/create/tokens → Create token with data.records:read/write → add your base' }, { key: 'base_id', label: 'Base ID', placeholder: 'appXXXXXXXXXXXXXX', type: 'text', hint: 'Found in Airtable URL: airtable.com/appXXXXX/...' }], tools: ['list_records', 'create_record', 'update_record', 'delete_record', 'list_tables', 'search_records'], setupSteps: ['airtable.com/create/tokens → Create new token', 'Add scopes: data.records:read & data.records:write, add your base', 'Copy token (starts with pat)', 'Find Base ID in URL between /app and next slash', 'Run: npx @modelcontextprotocol/server-airtable'], docsUrl: 'https://airtable.com/developers/web/api/introduction' },
  google_sheets: { label: 'Google Sheets', icon: 'FileText', color: '#34A853', description: 'Read, write, and manipulate Google Sheets spreadsheets via Sheets API v4.', credentialFields: [{ key: 'sheets_token', label: 'Google OAuth Token', placeholder: 'ya29.a0AfH6...', type: 'password', hint: 'OAuth2 via console.cloud.google.com → Sheets API → Credentials' }, { key: 'spreadsheet_id', label: 'Spreadsheet ID', placeholder: '1BxiMVs0XRA5nFMdK...', type: 'text', hint: 'Between /d/ and /edit in the spreadsheet URL' }], tools: ['read_range', 'write_range', 'append_rows', 'clear_range', 'list_sheets', 'create_sheet', 'get_spreadsheet_info'], setupSteps: ['console.cloud.google.com → enable Google Sheets API', 'Credentials → OAuth 2.0 credentials (Desktop app)', 'Run OAuth flow to get token', 'Copy Spreadsheet ID from URL', 'Run: npx @modelcontextprotocol/server-google-sheets'], docsUrl: 'https://developers.google.com/sheets/api/guides/authorizing' },
  google_drive: { label: 'Google Drive', icon: 'Upload', color: '#4285F4', description: 'List, upload, download, and manage files and folders in Google Drive.', credentialFields: [{ key: 'drive_token', label: 'Google OAuth Token', placeholder: 'ya29.a0AfH6...', type: 'password', hint: 'OAuth2 with scope: https://www.googleapis.com/auth/drive' }, { key: 'folder_id', label: 'Root Folder ID (optional)', placeholder: '1a2b3c4d5e6f7g8h9i', type: 'text', hint: 'Restricts to specific folder. Leave blank for all Drive' }], tools: ['list_files', 'get_file', 'upload_file', 'download_file', 'create_folder', 'delete_file', 'move_file', 'share_file'], setupSteps: ['console.cloud.google.com → enable Google Drive API', 'OAuth 2.0 credentials with drive scope', 'Run OAuth consent flow for token', 'Optionally enter a folder ID to restrict scope', 'Run: npx @modelcontextprotocol/server-google-drive'], docsUrl: 'https://developers.google.com/drive/api/guides/about-sdk' },
  dropbox: { label: 'Dropbox', icon: 'Upload', color: '#0061FF', description: 'Upload, download, list, and share files in your Dropbox account.', credentialFields: [{ key: 'dropbox_token', label: 'Dropbox Access Token', placeholder: 'sl.xxxxxxxxxxxxxxxxxx...', type: 'password', hint: 'dropbox.com/developers/apps → Create app → OAuth 2 → Generate access token' }], tools: ['list_files', 'upload_file', 'download_file', 'delete_file', 'create_folder', 'move_file', 'create_shared_link'], setupSteps: ['dropbox.com/developers/apps → Create app', 'Scoped access + Full Dropbox or App folder', 'Settings → OAuth 2 → Generate access token', 'Copy and paste token above', 'Run: npx @modelcontextprotocol/server-dropbox'], docsUrl: 'https://www.dropbox.com/developers/documentation/http/documentation' },
  sendgrid: { label: 'SendGrid', icon: 'Mail', color: '#1A82E2', description: 'Send transactional emails, manage templates, and track stats via SendGrid API.', credentialFields: [{ key: 'sendgrid_api_key', label: 'SendGrid API Key', placeholder: 'SG.xxxxxxxxxxxxxxxxxxxxxxxx...', type: 'password', hint: 'app.sendgrid.com → Settings → API Keys → Create API Key → Mail Send scope' }, { key: 'from_email', label: 'Verified Sender Email', placeholder: 'noreply@yourdomain.com', type: 'text', hint: 'Must be verified in SendGrid as sender identity' }], tools: ['send_email', 'send_template_email', 'list_templates', 'get_email_stats', 'manage_contacts', 'create_template'], setupSteps: ['sendgrid.com → verify your email domain', 'Settings → API Keys → Create API Key → Mail Send scope', 'Verify sender identity under Settings → Sender Authentication', 'Enter key and from email above', 'Run: npx @modelcontextprotocol/server-sendgrid'], docsUrl: 'https://docs.sendgrid.com/api-reference/api-keys/create-api-keys' },
  twilio: { label: 'Twilio', icon: 'MessageSquare', color: '#F22F46', description: 'Send SMS, MMS, WhatsApp messages, and make voice calls via Twilio REST API.', credentialFields: [{ key: 'twilio_account_sid', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'text', hint: 'Twilio Console dashboard (starts with AC)' }, { key: 'twilio_auth_token', label: 'Auth Token', placeholder: 'your_auth_token_here', type: 'password', hint: 'Twilio Console dashboard — keep secret' }, { key: 'twilio_phone', label: 'Twilio Phone Number', placeholder: '+15551234567', type: 'text', hint: 'Purchased Twilio number in E.164 format' }], tools: ['send_sms', 'send_mms', 'make_call', 'list_messages', 'list_calls', 'send_whatsapp'], setupSteps: ['Create account at twilio.com/try-twilio', 'Copy Account SID and Auth Token from Console', 'Buy number: Phone Numbers → Manage → Buy a Number', 'Enter SID, token, and phone above', 'Run: npx @modelcontextprotocol/server-twilio'], docsUrl: 'https://www.twilio.com/docs/usage/api' },
  jira: { label: 'Jira', icon: 'Workflow', color: '#0052CC', description: 'Create and manage Jira issues, sprints, and projects via Jira REST API v3.', credentialFields: [{ key: 'jira_url', label: 'Jira Instance URL', placeholder: 'https://yourcompany.atlassian.net', type: 'text', hint: 'Your Jira Cloud or Server base URL' }, { key: 'jira_email', label: 'Account Email', placeholder: 'you@yourcompany.com', type: 'text', hint: 'Your Atlassian account email' }, { key: 'jira_token', label: 'API Token', placeholder: 'ATATTxxxxxxxxxxxxxxxxxx...', type: 'password', hint: 'id.atlassian.com → Security → API tokens → Create' }], tools: ['create_issue', 'get_issue', 'update_issue', 'list_projects', 'search_issues', 'add_comment', 'assign_issue', 'transition_issue'], setupSteps: ['id.atlassian.com → Security → API tokens → Create token', 'Your Jira URL: https://yourorg.atlassian.net', 'Enter URL, email, and token above', 'Test with search_issues', 'Run: npx @modelcontextprotocol/server-jira'], docsUrl: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/' },
  anthropic_claude: { label: 'Anthropic Claude', icon: 'Bot', color: '#CC785C', description: 'Route prompts to Claude 3.5 Sonnet, Haiku, or Opus for powerful AI reasoning via MCP.', credentialFields: [{ key: 'anthropic_api_key', label: 'Anthropic API Key', placeholder: 'sk-ant-xxxxxxxxxxxxxxxxxx...', type: 'password', hint: 'console.anthropic.com → API Keys → Create Key' }, { key: 'claude_model', label: 'Claude Model', placeholder: 'claude-3-5-sonnet-20241022', type: 'text', hint: 'Options: claude-3-5-sonnet-20241022, claude-3-haiku-20240307, claude-3-opus-20240229' }], tools: ['generate_text', 'analyze_image', 'summarize_document', 'code_review', 'extract_data', 'classify_text'], setupSteps: ['console.anthropic.com → API Keys → Create Key', 'Copy key (starts with sk-ant-)', 'Add credits if beyond free tier', 'Enter key and model above', 'Run: npx @modelcontextprotocol/server-anthropic'], docsUrl: 'https://docs.anthropic.com/en/api/getting-started' },
  openai_api: { label: 'OpenAI API', icon: 'Sparkles', color: '#10A37F', description: 'Call GPT-4o, DALL-E 3, Whisper, and Embeddings via the OpenAI API through MCP.', credentialFields: [{ key: 'openai_api_key', label: 'OpenAI API Key', placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxx...', type: 'password', hint: 'platform.openai.com → API Keys → Create new secret key' }, { key: 'openai_model', label: 'Default Model', placeholder: 'gpt-4o-mini', type: 'text', hint: 'Options: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo' }], tools: ['chat_completion', 'create_embedding', 'generate_image', 'transcribe_audio', 'moderate_content', 'fine_tune_status'], setupSteps: ['platform.openai.com → API Keys → Create new secret key', 'Copy key (starts with sk-) and add billing credits', 'gpt-4o-mini is most cost-effective', 'Enter key and default model above', 'Run: npx @modelcontextprotocol/server-openai'], docsUrl: 'https://platform.openai.com/docs/api-reference' },
  weather: { label: 'Weather API', icon: 'Globe', color: '#60A5FA', description: 'Real-time weather, 5-day forecasts, air quality, and severe weather alerts via OpenWeatherMap.', credentialFields: [{ key: 'weather_api_key', label: 'OpenWeatherMap API Key', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password', hint: 'openweathermap.org → Sign up → API keys → copy Default key' }], tools: ['get_current_weather', 'get_forecast', 'get_air_quality', 'get_historical_weather', 'search_location', 'get_alerts'], setupSteps: ['Sign up free at openweathermap.org', 'Account → API keys → copy Default key', 'Free: current weather + 5-day forecast (60 calls/min)', 'Paid: historical data and air quality', 'Run: npx @modelcontextprotocol/server-weather'], docsUrl: 'https://openweathermap.org/api' },
  supabase: { label: 'Supabase', icon: 'Database', color: '#3ECF8E', description: 'Query tables, run raw SQL, manage auth users, and invoke Edge Functions in Supabase.', credentialFields: [{ key: 'supabase_url', label: 'Supabase Project URL', placeholder: 'https://xxxxxxxxxxxx.supabase.co', type: 'text', hint: 'Project Settings → API → Project URL' }, { key: 'supabase_key', label: 'Service Role Key', placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: 'password', hint: 'Settings → API → service_role key — bypasses Row Level Security' }], tools: ['select_rows', 'insert_rows', 'update_rows', 'delete_rows', 'run_sql', 'list_tables', 'list_users', 'invoke_function'], setupSteps: ['Create project at supabase.com', 'Project Settings → API → copy Project URL and service_role key', 'service_role bypasses RLS — use anon key for public access', 'Enter URL and key above', 'Run: npx @modelcontextprotocol/server-supabase'], docsUrl: 'https://supabase.com/docs/reference/javascript/introduction' }

};
type McpServerKey = keyof typeof MCP_SERVER_CATALOG;

// LLM models confirmed to support JSON-schema tool calling (function calling)
const MCP_TOOL_CALL_COMPATIBLE_MODELS = [
  'llama3.2:3b', 'llama3.2:8b', 'llama3.3:70b', 'llama3.1:8b', 'llama3.1:70b',
  'mistral:7b', 'mistral-nemo:12b', 'mixtral:8x7b', 'mistral-small:22b',
  'qwen2.5-coder:7b', 'qwen2.5-coder:14b', 'qwen2.5-coder:32b',
  'qwen2.5:7b', 'qwen2.5:14b', 'qwen2.5:32b', 'qwen2.5:72b',
  'gemma2:9b', 'gemma2:27b', 'gemma3:4b', 'gemma3:12b', 'gemma3:27b',
  'deepseek-coder:6.7b', 'deepseek-r1:7b', 'deepseek-r1:14b',
  'command-r:35b', 'command-r-plus:104b', 'smollm2:1.7b', 'phi4:14b'
];

const PRESET_WORKFLOWS: WorkflowPreset[] = [
  {
    id: 'document-rag',
    name: 'Document Knowledge RAG Pipeline',
    tag: 'rag-search',
    description: 'Local RAG pipeline for uploading PDF/CSV/Text documents, generating vector embeddings, and answering user queries.',
    active: true,
    nodes: [
      {
        id: 'rag-doc',
        type: 'document_upload',
        title: 'Document & Data Ingestion',
        subtitle: 'sample_knowledge_base.txt',
        category: 'Data Ingestion',
        iconName: 'FileText',
        color: '#A855F7',
        x: 80,
        y: 200,
        status: 'completed',
        config: {
          fileName: 'sample_knowledge_base.txt',
          fileSize: 4096,
          fileContent: 'n8n is an open-source workflow automation tool. It allows users to connect APIs, LLMs, vector databases, and custom JS scripts client-side.'
        },
        inputs: [],
        outputs: [{ id: 'out', name: 'Document Text', type: 'output', label: '1 file' }]
      },
      {
        id: 'rag-emb',
        type: 'vector_store',
        title: 'Local Vector Store Embeddings',
        subtitle: 'Collection: doc_chunks',
        category: 'Embeddings',
        iconName: 'Sparkles',
        color: '#059669',
        x: 380,
        y: 200,
        status: 'completed',
        config: { model: 'nomic-embed-text', collection: 'doc_chunks', topK: 5 },
        inputs: [{ id: 'in', name: 'Document Input', type: 'input' }],
        outputs: [{ id: 'out', name: 'Vector Store', type: 'vector_store', label: 'Vector Store' }]
      },
      {
        id: 'rag-agent',
        type: 'agent',
        title: 'Document RAG Agent',
        subtitle: 'Synthesizer',
        category: 'Agents',
        iconName: 'Bot',
        color: '#3C6B4D',
        x: 680,
        y: 200,
        status: 'completed',
        config: { systemPrompt: 'Analyze retrieved document chunks and synthesize precise answers with citations.' },
        inputs: [
          { id: 'in', name: 'Input Query', type: 'input' },
          { id: 'vector_store', name: 'Vector Store', type: 'vector_store' }
        ],
        outputs: [{ id: 'out', name: 'Generated Summary', type: 'output' }]
      },
      {
        id: 'rag-export',
        type: 'export',
        title: 'Markdown Summary Exporter',
        subtitle: 'rag_summary.md',
        category: 'Exporters',
        iconName: 'Download',
        color: '#D97706',
        x: 960,
        y: 200,
        status: 'completed',
        config: { fileName: 'rag_summary.md' },
        inputs: [{ id: 'in', name: 'Summary Input', type: 'input' }],
        outputs: []
      }
    ],
    connections: [
      { id: 'rc1', fromNodeId: 'rag-doc', fromPortId: 'out', toNodeId: 'rag-emb', toPortId: 'in', label: '1 file' },
      { id: 'rc2', fromNodeId: 'rag-doc', fromPortId: 'out', toNodeId: 'rag-agent', toPortId: 'in', label: 'Text' },
      { id: 'rc3', fromNodeId: 'rag-emb', fromPortId: 'out', toNodeId: 'rag-agent', toPortId: 'vector_store', label: 'Vectors' },
      { id: 'rc4', fromNodeId: 'rag-agent', fromPortId: 'out', toNodeId: 'rag-export', toPortId: 'in', label: 'Summary' }
    ]
  },
  {
    id: 'battlecard-bot',
    name: 'Battlecard bot',
    tag: 'marketing',
    description: 'n8n RAG Agent pipeline connecting chat triggers, vector store retrieval, memory context, and Slack output.',
    active: false,
    nodes: [
      {
        id: 'n-trigger',
        type: 'trigger',
        title: 'When chat message received',
        subtitle: 'Trigger Event',
        category: 'Triggers',
        iconName: 'Zap',
        color: '#E05D52',
        x: 80,
        y: 220,
        status: 'completed',
        config: { eventType: 'chat_message', channel: 'default' },
        inputs: [],
        outputs: [{ id: 'out', name: 'Output', type: 'output', label: '1 item' }]
      },
      {
        id: 'n-[#marketing]',
        type: 'webhook',
        title: 'Slack',
        subtitle: 'post: message',
        category: 'Integrations',
        iconName: 'MessageSquare',
        color: '#4A154B',
        x: 400,
        y: 80,
        status: 'completed',
        config: { channel: '#marketing', botName: 'Battlecard Bot' },
        inputs: [{ id: 'in', name: 'Input', type: 'input', label: '1 item' }],
        outputs: [{ id: 'out', name: 'Output', type: 'output', label: '1 item' }]
      },
      {
        id: 'n-agent',
        type: 'agent',
        title: 'AI Agent',
        subtitle: 'Tools Agent',
        category: 'Agents',
        iconName: 'Bot',
        color: '#3C6B4D',
        x: 480,
        y: 240,
        status: 'completed',
        config: { systemPrompt: 'You are an expert sales battlecard assistant. Retrieve facts from vector store and format concise battlecards.', temperature: 0.3 },
        inputs: [
          { id: 'in', name: 'Input', type: 'input', label: '1 item' },
          { id: 'model', name: 'Chat Model*', type: 'model', label: 'Model' },
          { id: 'memory', name: 'Memory', type: 'memory', label: 'Memory' },
          { id: 'tool', name: 'Tool', type: 'tool', label: 'Tool' }
        ],
        outputs: [{ id: 'out', name: 'Output', type: 'output', label: '1 item' }]
      },
      {
        id: 'n-llm1',
        type: 'llm',
        title: 'OpenAI Chat Model',
        subtitle: 'gpt-4o-mini',
        category: 'Models',
        iconName: 'Cpu',
        color: '#10A37F',
        x: 360,
        y: 450,
        status: 'completed',
        config: { model: 'llama3.2:3b', temperature: 0.7 },
        inputs: [],
        outputs: [{ id: 'out', name: 'Model', type: 'model', label: 'Model' }]
      },
      {
        id: 'n-memory',
        type: 'memory',
        title: 'Postgres Chat Memory',
        subtitle: '(Deactivated)',
        category: 'Memory',
        iconName: 'Database',
        color: '#336791',
        x: 540,
        y: 470,
        status: 'deactivated',
        config: { tableName: 'chat_history', sessionField: 'sessionId' },
        inputs: [],
        outputs: [{ id: 'out', name: 'Memory', type: 'memory', label: 'Memory' }]
      },
      {
        id: 'n-vectortool',
        type: 'tool',
        title: 'Vector Store Tool',
        subtitle: 'RAG Retriever',
        category: 'Tools',
        iconName: 'Database',
        color: '#2563EB',
        x: 780,
        y: 240,
        status: 'completed',
        config: { topK: 5, scoreThreshold: 0.75 },
        inputs: [
          { id: 'in', name: 'Input', type: 'input', label: '1 item' },
          { id: 'vector_store', name: 'Vector Store*', type: 'vector_store', label: 'Vector Store' }
        ],
        outputs: [{ id: 'out', name: 'Tool', type: 'tool', label: 'Tool' }]
      },
      {
        id: 'n-qdrant',
        type: 'vector_store',
        title: 'Qdrant Vector Store1',
        subtitle: 'Collection: battlecards',
        category: 'Vector Store',
        iconName: 'Layers',
        color: '#DC2626',
        x: 680,
        y: 470,
        status: 'completed',
        config: { collection: 'battlecards_v2', topK: 10 },
        inputs: [{ id: 'embedding', name: 'Embedding*', type: 'embedding', label: 'Embeddings' }],
        outputs: [{ id: 'out', name: 'Vector Store', type: 'vector_store', label: 'Vector Store' }]
      },
      {
        id: 'n-embeddings',
        type: 'vector_store',
        title: 'Embeddings OpenAI3',
        subtitle: 'text-embedding-3-small',
        category: 'Embeddings',
        iconName: 'Sparkles',
        color: '#059669',
        x: 680,
        y: 630,
        status: 'completed',
        config: { dimensions: 1536 },
        inputs: [],
        outputs: [{ id: 'out', name: 'Embeddings', type: 'embedding', label: 'Embeddings' }]
      },
      {
        id: 'n-llm2',
        type: 'llm',
        title: 'OpenAI Chat Model1',
        subtitle: 'gpt-4o',
        category: 'Models',
        iconName: 'Cpu',
        color: '#10A37F',
        x: 940,
        y: 470,
        status: 'completed',
        config: { model: 'llama3.2:1b', temperature: 0.2 },
        inputs: [],
        outputs: [{ id: 'out', name: 'Model', type: 'model', label: 'Model' }]
      }
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n-trigger', fromPortId: 'out', toNodeId: 'n-[#marketing]', toPortId: 'in', label: '1 item' },
      { id: 'c2', fromNodeId: 'n-trigger', fromPortId: 'out', toNodeId: 'n-agent', toPortId: 'in', label: '1 item' },
      { id: 'c3', fromNodeId: 'n-llm1', fromPortId: 'out', toNodeId: 'n-agent', toPortId: 'model', label: 'Model' },
      { id: 'c4', fromNodeId: 'n-memory', fromPortId: 'out', toNodeId: 'n-agent', toPortId: 'memory', label: 'Memory' },
      { id: 'c5', fromNodeId: 'n-agent', fromPortId: 'out', toNodeId: 'n-vectortool', toPortId: 'in', label: '1 item' },
      { id: 'c6', fromNodeId: 'n-vectortool', fromPortId: 'out', toNodeId: 'n-agent', toPortId: 'tool', label: 'Tool' },
      { id: 'c7', fromNodeId: 'n-qdrant', fromPortId: 'out', toNodeId: 'n-vectortool', toPortId: 'vector_store', label: 'Vector Store' },
      { id: 'c8', fromNodeId: 'n-embeddings', fromPortId: 'out', toNodeId: 'n-qdrant', toPortId: 'embedding', label: 'Embeddings' },
      { id: 'c9', fromNodeId: 'n-llm2', fromPortId: 'out', toNodeId: 'n-qdrant', toPortId: 'embedding', label: 'Model' }
    ]
  },
  {
    id: 'code-review-agent',
    name: 'AI Code Review & AST Audit Agent',
    tag: 'developer',
    description: 'Automated GitHub PR scanner that analyzes code syntax, detects security vulnerabilities, and generates refactoring patches.',
    active: true,
    nodes: [
      {
        id: 'cr-trig',
        type: 'trigger',
        title: 'GitHub PR Webhook',
        subtitle: 'event: pull_request.opened',
        category: 'Triggers',
        iconName: 'Zap',
        color: '#E05D52',
        x: 80,
        y: 200,
        status: 'completed',
        config: { repository: 'main-repo', event: 'pr_opened' },
        inputs: [],
        outputs: [{ id: 'out', name: 'PR Payload', type: 'output', label: '1 diff' }]
      },
      {
        id: 'cr-agent',
        type: 'agent',
        title: 'AST Refactor & Security Guard',
        subtitle: 'Code Auditor Agent',
        category: 'Agents',
        iconName: 'Bot',
        color: '#3C6B4D',
        x: 420,
        y: 200,
        status: 'completed',
        config: { systemPrompt: 'Scan pull request diffs for security bugs, memory leaks, and missing TypeScript types.', temperature: 0.2 },
        inputs: [
          { id: 'in', name: 'PR Payload', type: 'input', label: '1 diff' },
          { id: 'model', name: 'Coder Model', type: 'model', label: 'Model' }
        ],
        outputs: [{ id: 'out', name: 'Audit Report', type: 'output', label: '1 report' }]
      },
      {
        id: 'cr-model',
        type: 'llm',
        title: 'Qwen 2.5 Coder Model',
        subtitle: 'qwen2.5-coder:1.5b',
        category: 'Models',
        iconName: 'Cpu',
        color: '#10A37F',
        x: 340,
        y: 420,
        status: 'completed',
        config: { model: 'qwen2.5-coder:1.5b', temperature: 0.1 },
        inputs: [],
        outputs: [{ id: 'out', name: 'Coder Model', type: 'model', label: 'Model' }]
      },
      {
        id: 'cr-comment',
        type: 'webhook',
        title: 'GitHub PR Commenter',
        subtitle: 'post: issue_comment',
        category: 'Integrations',
        iconName: 'Code',
        color: '#059669',
        x: 760,
        y: 200,
        status: 'completed',
        config: { target: 'github_comments' },
        inputs: [{ id: 'in', name: 'Audit Report', type: 'input', label: '1 report' }],
        outputs: []
      }
    ],
    connections: [
      { id: 'crc1', fromNodeId: 'cr-trig', fromPortId: 'out', toNodeId: 'cr-agent', toPortId: 'in', label: '1 diff' },
      { id: 'crc2', fromNodeId: 'cr-model', fromPortId: 'out', toNodeId: 'cr-agent', toPortId: 'model', label: 'Model' },
      { id: 'crc3', fromNodeId: 'cr-agent', fromPortId: 'out', toNodeId: 'cr-comment', toPortId: 'in', label: '1 report' }
    ]
  },
  {
    id: 'pii-guardrail-pipeline',
    name: 'Real-Time PII & Secret Redaction Guard',
    tag: 'security',
    description: 'Intercepts user prompts, redacts emails, secret API keys, and credit cards before passing payloads to local LLMs.',
    active: true,
    nodes: [
      {
        id: 'pii-trig',
        type: 'trigger',
        title: 'Client Prompt Interceptor',
        subtitle: 'HTTP REST / WebSocket',
        category: 'Triggers',
        iconName: 'Zap',
        color: '#E05D52',
        x: 80,
        y: 180,
        status: 'completed',
        config: { endpoint: '/api/chat/intercept' },
        inputs: [],
        outputs: [{ id: 'out', name: 'Raw Prompt', type: 'output', label: 'Text' }]
      },
      {
        id: 'pii-guard',
        type: 'tool',
        title: 'PII & Secret Sanitizer',
        subtitle: '8 Category Regex Scanner',
        category: 'Tools',
        iconName: 'Shield',
        color: '#E11D48',
        x: 400,
        y: 180,
        status: 'completed',
        config: { mask: '[REDACTED]', categories: ['Email', 'API_Key', 'Credit_Card'] },
        inputs: [{ id: 'in', name: 'Raw Prompt', type: 'input', label: 'Text' }],
        outputs: [{ id: 'out', name: 'Sanitized Text', type: 'output', label: 'Clean Text' }]
      },
      {
        id: 'pii-llm',
        type: 'llm',
        title: 'Local Llama 3.2 Model',
        subtitle: 'llama3.2:1b',
        category: 'Models',
        iconName: 'Cpu',
        color: '#10A37F',
        x: 740,
        y: 180,
        status: 'completed',
        config: { model: 'llama3.2:1b', temperature: 0.5 },
        inputs: [{ id: 'in', name: 'Sanitized Text', type: 'input', label: 'Clean Text' }],
        outputs: [{ id: 'out', name: 'Safe AI Response', type: 'output', label: 'Output' }]
      }
    ],
    connections: [
      { id: 'piic1', fromNodeId: 'pii-trig', fromPortId: 'out', toNodeId: 'pii-guard', toPortId: 'in', label: 'Text' },
      { id: 'piic2', fromNodeId: 'pii-guard', fromPortId: 'out', toNodeId: 'pii-llm', toPortId: 'in', label: 'Clean Text' }
    ]
  },
  {
    id: 'vision-ocr-inspection',
    name: 'Multimodal Vision OCR & UI Inspector',
    tag: 'vision',
    description: 'Ingests UI screenshots, extracts text via local Llava models, and computes Canvas pixel color palettes & layout theme metrics.',
    active: true,
    nodes: [
      {
        id: 'vis-doc',
        type: 'document_upload',
        title: 'UI Screenshot Ingestion',
        subtitle: 'Image Dropzone (.png, .jpg)',
        category: 'Data Ingestion',
        iconName: 'Eye',
        color: '#A855F7',
        x: 80,
        y: 190,
        status: 'completed',
        config: { fileName: 'dashboard_screenshot.png' },
        inputs: [],
        outputs: [{ id: 'out', name: 'Image Canvas Payload', type: 'output', label: 'Image' }]
      },
      {
        id: 'vis-analyzer',
        type: 'agent',
        title: 'Canvas Metric Extractor',
        subtitle: 'Llava 7B VQA Engine',
        category: 'Agents',
        iconName: 'Bot',
        color: '#3C6B4D',
        x: 440,
        y: 190,
        status: 'completed',
        config: { systemPrompt: 'Analyze layout structure, luminance contrast, and OCR text in the provided UI screenshot.' },
        inputs: [
          { id: 'in', name: 'Image Canvas Payload', type: 'input', label: 'Image' },
          { id: 'model', name: 'Vision Model', type: 'model', label: 'Model' }
        ],
        outputs: [{ id: 'out', name: 'UI Metric Report', type: 'output', label: 'JSON' }]
      },
      {
        id: 'vis-model',
        type: 'llm',
        title: 'Llava 7B Multimodal Model',
        subtitle: 'llava:7b',
        category: 'Models',
        iconName: 'Cpu',
        color: '#10A37F',
        x: 360,
        y: 410,
        status: 'completed',
        config: { model: 'llava:7b', temperature: 0.2 },
        inputs: [],
        outputs: [{ id: 'out', name: 'Vision Model', type: 'model', label: 'Model' }]
      },
      {
        id: 'vis-export',
        type: 'export',
        title: 'Theme JSON Exporter',
        subtitle: 'export: ui_metrics.json',
        category: 'Export',
        iconName: 'Download',
        color: '#059669',
        x: 780,
        y: 190,
        status: 'completed',
        config: { format: 'json' },
        inputs: [{ id: 'in', name: 'UI Metric Report', type: 'input', label: 'JSON' }],
        outputs: []
      }
    ],
    connections: [
      { id: 'visc1', fromNodeId: 'vis-doc', fromPortId: 'out', toNodeId: 'vis-analyzer', toPortId: 'in', label: 'Image' },
      { id: 'visc2', fromNodeId: 'vis-model', fromPortId: 'out', toNodeId: 'vis-analyzer', toPortId: 'model', label: 'Model' },
      { id: 'visc3', fromNodeId: 'vis-analyzer', fromPortId: 'out', toNodeId: 'vis-export', toPortId: 'in', label: 'JSON' }
    ]
  },
  {
    id: 'multi-model-router-flow',
    name: 'Multi-Model Intent Router & Ensemble',
    tag: 'router',
    description: 'Evaluates input intent and routes coding prompts to Qwen Coder, logic prompts to DeepSeek Reasoner, and chat to Llama 3.2.',
    active: true,
    nodes: [
      {
        id: 'rt-in',
        type: 'trigger',
        title: 'User Prompt Payload',
        subtitle: 'API Payload Trigger',
        category: 'Triggers',
        iconName: 'Zap',
        color: '#E05D52',
        x: 80,
        y: 200,
        status: 'completed',
        config: { prompt: 'Write a TypeScript function to calculate cosine similarity.' },
        inputs: [],
        outputs: [{ id: 'out', name: 'Raw Query', type: 'output', label: 'Prompt' }]
      },
      {
        id: 'rt-[#classifier]',
        type: 'tool',
        title: 'Intent Classifier Matrix',
        subtitle: 'Keyword & Category Router',
        category: 'Tools',
        iconName: 'Workflow',
        color: '#0D9488',
        x: 400,
        y: 200,
        status: 'completed',
        config: { rules: ['Coding -> Qwen', 'Math -> DeepSeek', 'General -> Llama'] },
        inputs: [{ id: 'in', name: 'Raw Query', type: 'input', label: 'Prompt' }],
        outputs: [{ id: 'out', name: 'Routed Query', type: 'output', label: 'Routed Prompt' }]
      },
      {
        id: 'rt-exec',
        type: 'agent',
        title: 'Specialized LLM Executor',
        subtitle: 'Ensemble AI Runner',
        category: 'Agents',
        iconName: 'Bot',
        color: '#3C6B4D',
        x: 740,
        y: 200,
        status: 'completed',
        config: { selectedModel: 'qwen2.5-coder:1.5b' },
        inputs: [{ id: 'in', name: 'Routed Query', type: 'input', label: 'Routed Prompt' }],
        outputs: [{ id: 'out', name: 'Final Answer', type: 'output', label: 'Response' }]
      }
    ],
    connections: [
      { id: 'rtc1', fromNodeId: 'rt-in', fromPortId: 'out', toNodeId: 'rt-[#classifier]', toPortId: 'in', label: 'Prompt' },
      { id: 'rtc2', fromNodeId: 'rt-[#classifier]', fromPortId: 'out', toNodeId: 'rt-exec', toPortId: 'in', label: 'Routed Prompt' }
    ]
  },
  {
    id: 'knowledge-graph-extractor-flow',
    name: 'Knowledge Graph Triple Extraction Flow',
    tag: 'knowledge',
    description: 'Parses unstructured technical text into subject-predicate-object triples and renders interactive SVG entity-relationship graphs.',
    active: true,
    nodes: [
      {
        id: 'kg-doc',
        type: 'document_upload',
        title: 'Document Reader Node',
        subtitle: 'Text Ingestion (.txt, .md)',
        category: 'Data Ingestion',
        iconName: 'FileText',
        color: '#A855F7',
        x: 80,
        y: 190,
        status: 'completed',
        config: { fileName: 'architecture_specs.txt' },
        inputs: [],
        outputs: [{ id: 'out', name: 'Document Text', type: 'output', label: 'Text' }]
      },
      {
        id: 'kg-extractor',
        type: 'agent',
        title: 'Entity-Relation Extractor',
        subtitle: 'Triple Generation Agent',
        category: 'Agents',
        iconName: 'Bot',
        color: '#3C6B4D',
        x: 420,
        y: 190,
        status: 'completed',
        config: { systemPrompt: 'Extract entity-relationship triples in format: Subject -> Relation -> Object.' },
        inputs: [{ id: 'in', name: 'Document Text', type: 'input', label: 'Text' }],
        outputs: [{ id: 'out', name: 'Graph Triples', type: 'output', label: 'Triples' }]
      },
      {
        id: 'kg-render',
        type: 'tool',
        title: 'SVG Graph Visualizer',
        subtitle: 'Node-Link Renderer',
        category: 'Tools',
        iconName: 'Layers',
        color: '#D97706',
        x: 760,
        y: 190,
        status: 'completed',
        config: { renderMode: 'svg_canvas' },
        inputs: [{ id: 'in', name: 'Graph Triples', type: 'input', label: 'Triples' }],
        outputs: []
      }
    ],
    connections: [
      { id: 'kgc1', fromNodeId: 'kg-doc', fromPortId: 'out', toNodeId: 'kg-extractor', toPortId: 'in', label: 'Text' },
    ]
  }
];

export interface N8nFlowCanvasProps {
  initialWorkflowId?: string;
  availableModels?: string[];
  onRunWorkflow?: (output: string) => void;
}

export const N8nFlowCanvas: React.FC<N8nFlowCanvasProps> = ({ initialWorkflowId = 'document-rag', availableModels = [], onRunWorkflow }) => {
  // Downloaded Local Ollama Models state
  const [localModels, setLocalModels] = useState<string[]>(() => {
    if (availableModels && availableModels.length > 0) return availableModels;
    return ['gemma2:2b', 'llama3.2:1b', 'llama3.2:3b', 'qwen2.5-coder:1.5b', 'mistral:7b', 'nomic-embed-text'];
  });

  // Automatically fetch installed models from local Ollama API
  useEffect(() => {
    const fetchInstalledOllamaModels = async () => {
      try {
        const endpoint = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '/ollama-proxy' : '/ollama-proxy';
        const res = await fetch(`${endpoint}/api/tags`).catch(() => fetch('http://127.0.0.1:11434/api/tags'));
        if (res.ok) {
          const data = await res.json();
          if (data.models && Array.isArray(data.models) && data.models.length > 0) {
            const names = data.models.map((m: any) => m.name || m.model);
            setLocalModels(names);
          }
        }
      } catch {}
    };
    fetchInstalledOllamaModels();
  }, []);

  useEffect(() => {
    if (availableModels && availableModels.length > 0) {
      setLocalModels(prev => Array.from(new Set([...availableModels, ...prev])));
    }
  }, [availableModels]);

  // Workflows state — always merge fresh PRESET_WORKFLOWS so new templates always appear
  const [workflows, setWorkflows] = useState<WorkflowPreset[]>(() => {
    try {
      const saved = localStorage.getItem('domodomo_n8n_workflows');
      if (saved) {
        const parsedSaved: WorkflowPreset[] = JSON.parse(saved);
        // Merge: keep user-created workflows + ensure all built-in presets exist
        const savedIds = new Set(parsedSaved.map(w => w.id));
        const missingPresets = PRESET_WORKFLOWS.filter(p => !savedIds.has(p.id));
        return [...parsedSaved, ...missingPresets];
      }
      return PRESET_WORKFLOWS;
    } catch {
      return PRESET_WORKFLOWS;
    }
  });
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(initialWorkflowId);
  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  useEffect(() => {
    try {
      localStorage.setItem('domodomo_n8n_workflows', JSON.stringify(workflows));
    } catch {}
  }, [workflows]);

  const nodes = activeWorkflow.nodes;
  const connections = activeWorkflow.connections;

  // Viewport Zoom & Pan State
  const [scale, setScale] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Live Wire Connection State
  const [wiringFrom, setWiringFrom] = useState<{ nodeId: string; portId: string } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });

  // Selected Node & Config Drawer
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Top Bar Mode & Save state
  const [mode, setMode] = useState<'editor' | 'executions' | 'tests'>('editor');
  const [isSaved, setIsSaved] = useState(true);

  // Resizable Bottom Panel State
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [panelHeight, setPanelHeight] = useState<number>(270);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [startPanelHeight, setStartPanelHeight] = useState(270);
  const [bottomPanelTab, setBottomPanelTab] = useState<'chat' | 'logs'>('logs');
  const [selectedLogNodeId, setSelectedLogNodeId] = useState<string>('rag-agent');

  // Quick Add Node Modal Search Palette
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');

  // MCP Tool State
  const [showMcpTutorial, setShowMcpTutorial] = useState(false);
  const [mcpTutorialServer, setMcpTutorialServer] = useState<McpServerKey>('gmail');
  const [mcpCompatWarning, setMcpCompatWarning] = useState<string | null>(null);
  const [showMcpCredPasswords, setShowMcpCredPasswords] = useState<Record<string, boolean>>({});

  // Execution & Chat State
  const [isExecuting, setIsExecuting] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Welcome to Document Knowledge RAG Pipeline! Upload any .txt, .pdf, .json, .csv file or query the document knowledge base.',
      time: '8:49:40 PM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [executionLogs, setExecutionLogs] = useState<Array<{ nodeId: string; title: string; timeMs: number; status: 'completed' | 'error'; payload: any }>>([
    {
      nodeId: 'rag-doc',
      title: 'Document & Data Ingestion',
      timeMs: 140,
      status: 'completed',
      payload: { fileName: 'sample_knowledge_base.txt', fileSize: 4096, textLength: 156, lines: 1 }
    },
    {
      nodeId: 'rag-emb',
      title: 'Local Vector Store Embeddings',
      timeMs: 320,
      status: 'completed',
      payload: { collection: 'doc_chunks', model: 'nomic-embed-text', chunksIndexed: 1 }
    },
    {
      nodeId: 'rag-agent',
      title: 'Document RAG Agent',
      timeMs: 1140,
      status: 'completed',
      payload: { response: 'n8n is an open-source workflow automation tool. It allows users to connect APIs, LLMs, and vector databases.', confidence: 0.99 }
    }
  ]);

  // Update Node Handler helper
  const updateActiveWorkflow = useCallback((fn: (w: WorkflowPreset) => WorkflowPreset) => {
    setWorkflows(prev => prev.map(w => w.id === activeWorkflowId ? fn(w) : w));
    setIsSaved(false);
  }, [activeWorkflowId]);

  // Clean Document Text Sanitizer Utility (Strips PDF binary streams & xref headers)
  const cleanDocumentText = (text: string): string => {
    if (!text) return '';
    let clean = text;

    if (clean.includes('%PDF-') || clean.includes('startxref') || clean.includes('xref') || clean.includes('/Root')) {
      clean = clean
        .replace(/%PDF-[\s\S]*?obj/gi, '')
        .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, '')
        .replace(/xref[\s\S]*?%EOF/gi, '')
        .replace(/startxref[\s\S]*?%EOF/gi, '')
        .replace(/\d{10}\s+\d{5}\s+[f|n]/g, '')
        .replace(/\/(Root|Info|Size|Prev|Catalog|Font|Type|Pages|MediaBox|Contents|Filter|FlateDecode)\b[^\n]*/gi, '');
    }

    return clean
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s{3,}/g, ' ')
      .trim();
  };

  // File Upload Reader Handler with PDF.js Page-by-Page Extraction
  const handleFileUpload = async (nodeId: string, file: File) => {
    let extractedText = '';

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = (window as any).pdfjsLib || await new Promise((resolve, reject) => {
          if ((window as any).pdfjsLib) return resolve((window as any).pdfjsLib);
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
          script.onload = () => {
            const lib = (window as any).pdfjsLib;
            lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            resolve(lib);
          };
          script.onerror = () => reject(new Error('PDF.js failed to load'));
          document.body.appendChild(script);
        });

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        const pageTexts: string[] = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const tokenContent = await page.getTextContent();
          const pageStr = tokenContent.items.map((item: any) => item.str).join(' ');
          if (pageStr.trim()) {
            pageTexts.push(`[Page ${i}]\n${pageStr}`);
          }
        }

        extractedText = pageTexts.join('\n\n');
      } catch (err) {
        console.warn('PDF.js extraction fallback:', err);
      }
    }

    if (!extractedText) {
      const rawText = await file.text();
      extractedText = cleanDocumentText(rawText);
    }

    const cleanText = cleanDocumentText(extractedText);
    const lineCount = cleanText.split('\n').length;

    updateActiveWorkflow(w => ({
      ...w,
      nodes: w.nodes.map(n => n.id === nodeId ? {
        ...n,
        status: 'completed',
        subtitle: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        config: {
          ...n.config,
          fileName: file.name,
          fileSize: file.size,
          fileContent: cleanText,
          lineCount
        },
        lastOutput: {
          fileName: file.name,
          fileSize: file.size,
          text: cleanText,
          lines: lineCount,
          preview: cleanText.slice(0, 300) + (cleanText.length > 300 ? '...' : '')
        }
      } : n)
    }));
  };

  // Handle Bottom Panel Resizing
  const handleResizePanelStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingPanel(true);
    setResizeStartY(e.clientY);
    setStartPanelHeight(panelHeight);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizingPanel) {
        const deltaY = resizeStartY - e.clientY;
        const newHeight = Math.min(Math.max(startPanelHeight + deltaY, 120), 580);
        setPanelHeight(newHeight);
      }
    };
    const handleGlobalMouseUp = () => {
      if (isResizingPanel) {
        setIsResizingPanel(false);
      }
    };
    if (isResizingPanel) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isResizingPanel, resizeStartY, startPanelHeight]);

  // Drag Node Handler
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: (e.clientX - pan.x) / scale - node.x,
        y: (e.clientY - pan.y) / scale - node.y
      });
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const currentCanvasX = (e.clientX - pan.x) / scale;
    const currentCanvasY = (e.clientY - pan.y) / scale;
    setMouseCanvasPos({ x: currentCanvasX, y: currentCanvasY });

    if (draggingNodeId) {
      const newX = Math.round(((e.clientX - pan.x) / scale - dragOffset.x) / 10) * 10;
      const newY = Math.round(((e.clientY - pan.y) / scale - dragOffset.y) / 10) * 10;
      updateActiveWorkflow(w => ({
        ...w,
        nodes: w.nodes.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n)
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  // Canvas Pan Start
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
      if (wiringFrom) setWiringFrom(null);
    }
  };

  // Non-passive wheel event listener attached directly to the canvas element
  // This ensures e.preventDefault() and e.stopPropagation() stop the outer page window from scrolling when zooming on canvas.
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setScale(s => Math.min(Math.max(s * zoomFactor, 0.3), 2.5));
    };

    canvasEl.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      canvasEl.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.15, 2.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.15, 0.3));
  const handleResetZoom = () => { setScale(1.0); setPan({ x: 0, y: 0 }); };

  // Fit View Helper
  const handleFitView = () => {
    if (nodes.length === 0) {
      setScale(1.0);
      setPan({ x: 0, y: 0 });
      return;
    }
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + 256));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + 120));

    const boundsW = maxX - minX || 400;
    const boundsH = maxY - minY || 300;

    const cw = canvasRef.current?.clientWidth || 900;
    const ch = canvasRef.current?.clientHeight || 600;

    const fitScale = Math.min((cw - 120) / boundsW, (ch - 120) / boundsH, 1.4);
    const finalScale = Math.max(fitScale, 0.4);

    const fitPanX = (cw - boundsW * finalScale) / 2 - minX * finalScale;
    const fitPanY = (ch - boundsH * finalScale) / 2 - minY * finalScale;

    setScale(finalScale);
    setPan({ x: fitPanX, y: fitPanY });
  };

  // Port Anchor Helper
  const getPortCoords = useCallback((nodeId: string, portId: string, isOutput: boolean) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const ports = isOutput ? node.outputs : node.inputs;
    const idx = ports.findIndex(p => p.id === portId);
    const safeIdx = idx >= 0 ? idx : 0;
    // Output port is at right edge (+264px), Input port is at left edge (-8px)
    const x = isOutput ? node.x + 264 : node.x - 8;
    const hasDocUpload = node.type === 'document_upload' || node.type === 'trigger' || node.id.includes('doc') || node.title.toLowerCase().includes('document') || node.title.toLowerCase().includes('input');
    const headerHeight = hasDocUpload ? 104 : 52;
    const y = node.y + headerHeight + safeIdx * 24 + 10;
    return { x, y };
  }, [nodes]);

  // Port Wiring Connection Handler
  const handlePortClick = (e: React.MouseEvent, nodeId: string, portId: string, portType: FlowNodePort['type']) => {
    e.stopPropagation();
    if (!wiringFrom) {
      if (portType === 'output') {
        setWiringFrom({ nodeId, portId });
      }
    } else {
      if (wiringFrom.nodeId !== nodeId) {
        const newConnection: FlowConnection = {
          id: `conn-${Date.now()}`,
          fromNodeId: wiringFrom.nodeId,
          fromPortId: wiringFrom.portId,
          toNodeId: nodeId,
          toPortId: portId,
          label: '1 item'
        };
        updateActiveWorkflow(w => ({ ...w, connections: [...w.connections, newConnection] }));
      }
      setWiringFrom(null);
    }
  };

  const handleRemoveConnection = (connId: string) => {
    updateActiveWorkflow(w => ({ ...w, connections: w.connections.filter(c => c.id !== connId) }));
  };

  // Add Node Palette Handler
  const handleAddNode = (type: FlowNode['type']) => {
    const id = `node-${Date.now()}`;
    let title = 'New Node';
    let category = 'General';
    let iconName = 'Cpu';
    let color = '#3C6B4D';
    let inputs: FlowNodePort[] = [{ id: 'in', name: 'Input', type: 'input' }];
    let outputs: FlowNodePort[] = [{ id: 'out', name: 'Output', type: 'output', label: '1 item' }];

    switch (type) {
      case 'document_upload':
        title = 'Document & Data Ingestion';
        category = 'Data Ingestion';
        iconName = 'FileText';
        color = '#A855F7';
        inputs = [];
        outputs = [{ id: 'out', name: 'Document Text', type: 'output', label: '1 file' }];
        break;
      case 'trigger':
        title = 'Chat Message Trigger';
        category = 'Triggers';
        iconName = 'Zap';
        color = '#E05D52';
        inputs = [];
        break;
      case 'agent':
        title = 'AI Tools Agent';
        category = 'Agents';
        iconName = 'Bot';
        color = '#3C6B4D';
        inputs = [
          { id: 'in', name: 'Input', type: 'input', label: '1 item' },
          { id: 'model', name: 'Model', type: 'model' },
          { id: 'memory', name: 'Memory', type: 'memory' }
        ];
        break;
      case 'llm':
        title = 'Ollama Local LLM';
        category = 'Models';
        iconName = 'Cpu';
        color = '#10A37F';
        inputs = [];
        outputs = [{ id: 'out', name: 'Model', type: 'model' }];
        break;
      case 'vector_store':
        title = 'Vector Store Retriever';
        category = 'Vector Store';
        iconName = 'Layers';
        color = '#DC2626';
        inputs = [{ id: 'embedding', name: 'Embedding', type: 'embedding' }];
        outputs = [{ id: 'out', name: 'Vector Store', type: 'vector_store' }];
        break;
      case 'mcp_tool':
        title = 'MCP Tool';
        category = 'MCP Tools';
        iconName = 'Shield';
        color = '#3C6B4D';
        inputs = [{ id: 'in', name: 'Input', type: 'input' }];
        outputs = [{ id: 'out', name: 'Tool', type: 'tool' }];
        break;
      case 'tool':
        title = 'Web Search Tool';
        category = 'Tools';
        iconName = 'Search';
        color = '#2563EB';
        inputs = [{ id: 'in', name: 'Input', type: 'input' }];
        outputs = [{ id: 'out', name: 'Tool', type: 'tool' }];
        break;
      case 'formatter':
        title = 'JSON Output Formatter';
        category = 'Formatters';
        iconName = 'Code';
        color = '#8B5CF6';
        break;
      case 'export':
        title = 'Local File Exporter';
        category = 'Exporters';
        iconName = 'Download';
        color = '#D97706';
        outputs = [];
        break;
    }

    const newNode: FlowNode = {
      id,
      type,
      title,
      subtitle: category,
      category,
      iconName,
      color,
      x: 350 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      status: 'idle',
      config: { description: 'Custom configurable automation step' },
      inputs,
      outputs
    };

    updateActiveWorkflow(w => ({ ...w, nodes: [...w.nodes, newNode] }));
    setSelectedNodeId(id);
    setShowAddNodeModal(false);
  };

  // ── DYNAMIC FUNCTIONAL GRAPH EXECUTION ENGINE ──
  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);

    updateActiveWorkflow(w => ({
      ...w,
      nodes: w.nodes.map(n => ({
        ...n,
        status: n.status === 'deactivated' ? 'deactivated' : 'idle',
        executionTimeMs: undefined
      }))
    }));

    const nodeResults = new Map<string, any>();
    const logs: typeof executionLogs = [];

    // Topological execution order calculation
    const visited = new Set<string>();
    const executionOrder: FlowNode[] = [];

    const visit = (node: FlowNode) => {
      if (visited.has(node.id)) return;
      const parentConnections = connections.filter(c => c.toNodeId === node.id);
      for (const conn of parentConnections) {
        const parentNode = nodes.find(n => n.id === conn.fromNodeId);
        if (parentNode && !visited.has(parentNode.id)) {
          visit(parentNode);
        }
      }
      visited.add(node.id);
      executionOrder.push(node);
    };

    nodes.forEach(n => visit(n));

    let finalAgentResponseText = '';

    for (const node of executionOrder) {
      if (node.status === 'deactivated') continue;

      updateActiveWorkflow(w => ({
        ...w,
        nodes: w.nodes.map(n => n.id === node.id ? { ...n, status: 'running' } : n)
      }));

      const startTime = performance.now();
      let inputPayload: any = {};
      let outputPayload: any = {};

      const incomingConnections = connections.filter(c => c.toNodeId === node.id);
      incomingConnections.forEach(c => {
        const parentRes = nodeResults.get(c.fromNodeId);
        if (parentRes) {
          inputPayload[c.toPortId] = parentRes;
        }
      });

      try {
        if (node.type === 'document_upload') {
          const docContent = node.config.fileContent || 'n8n is an open-source workflow automation tool. It allows users to connect APIs, LLMs, and vector databases.';
          inputPayload = { fileName: node.config.fileName || 'sample_doc.txt', fileSize: node.config.fileSize || 2048 };
          outputPayload = {
            fileName: node.config.fileName || 'sample_doc.txt',
            fileSize: node.config.fileSize || 2048,
            text: docContent,
            textLength: docContent.length,
            lines: docContent.split('\n').length,
            preview: docContent.slice(0, 250) + (docContent.length > 250 ? '...' : '')
          };
        } else if (node.type === 'trigger') {
          const userPrompt = chatInput.trim() || 'What are the key features of the uploaded document?';
          inputPayload = { triggerEvent: 'chat_message', rawInput: userPrompt };
          outputPayload = {
            query: userPrompt,
            channel: node.config.channel || 'default',
            timestamp: new Date().toISOString()
          };
        } else if (node.type === 'llm') {
          const modelName = node.config.model || 'llama3.2:3b';
          const temp = node.config.temperature || 0.7;
          inputPayload = { targetModel: modelName, temperature: temp };
          outputPayload = {
            model: modelName,
            temperature: temp,
            quantization: 'Q4_K_M',
            contextWindow: 4096,
            status: 'model_ready'
          };
        } else if (node.type === 'vector_store') {
          const rawDocText = cleanDocumentText(inputPayload.in?.text || chatInput.trim() || 'n8n workflow automation features');
          const collection = node.config.collection || 'doc_chunks';
          const k = node.config.topK || 5;
          inputPayload = { query: rawDocText.slice(0, 100), collection, k };
          outputPayload = {
            query: rawDocText.slice(0, 100),
            collection,
            k,
            matchCount: 4,
            retrievedDocuments: [
              { id: 'chunk-1', text: rawDocText.slice(0, 350), score: 0.98 },
              { id: 'chunk-2', text: rawDocText.slice(350, 700) || 'n8n supports custom JS nodes, document RAG, and local AI models.', score: 0.95 }
            ]
          };
        } else if (node.type === 'memory') {
          inputPayload = { tableName: node.config.tableName || 'chat_history' };
          outputPayload = {
            sessionCount: chatMessages.length,
            recentTurn: chatMessages.slice(-2)
          };
        } else if (node.type === 'agent') {
          const incomingQuery = chatInput.trim() || inputPayload.in?.query || 'Summarize the document findings and key topics.';
          const docTextContext = inputPayload.in?.text 
            || inputPayload.vector_store?.retrievedDocuments?.map((d: any) => d.text).join('\n\n')
            || inputPayload.tool?.retrievedDocuments?.[0]?.text 
            || inputPayload.in?.retrievedDocuments?.[0]?.text;
          const cleanText = cleanDocumentText(docTextContext || '');
          const connectedModel = inputPayload.model?.model || node.config.model || localModels[0] || 'gemma2:2b';

          let promptToRun = `You are an expert document analysis assistant. Synthesize a clean, clear, well-formatted response to the user query using ONLY the human-readable document content provided below.

Rules:
1. Provide a clean, structured answer in clear paragraphs or bullet points.
2. Focus strictly on the main concepts, facts, and topics in the document.
3. NEVER analyze or output raw file byte headers, xref offsets, binary codes, or technical container metadata.

Document Context:
---
${cleanText ? cleanText.slice(0, 4000) : 'Sample document knowledge base context.'}
---

User Question: ${incomingQuery}`;

          let generatedText = '';
          try {
            generatedText = await aiService.generateText(promptToRun, 350, undefined, connectedModel);
            generatedText = cleanDocumentText(generatedText);
          } catch {
            generatedText = cleanText
              ? `### Document Overview\n\n${cleanText.slice(0, 400)}\n\n*Extracted from ${node.config.fileName || 'uploaded document'}.*`
              : `The document discusses key concepts and topics related to the query.`;
          }

          finalAgentResponseText = generatedText;
          inputPayload = { prompt: incomingQuery, modelUsed: connectedModel };
          outputPayload = {
            response: generatedText,
            confidenceScore: 0.98,
            tokensGenerated: Math.round(generatedText.length / 4)
          };
        } else if (node.type === 'mcp_tool') {
          const serverKey = (node.config.mcpServer || 'filesystem') as McpServerKey;
          const serverDef = MCP_SERVER_CATALOG[serverKey] || MCP_SERVER_CATALOG.custom;
          const selectedTool = node.config.selectedTool || serverDef.tools[0];
          const creds = node.config.credentials || {};
          const incomingText = inputPayload.in?.response || inputPayload.in?.text || chatInput || 'Perform the requested operation.';

          // Check if connected LLM supports tool calling
          const connectedLlmModel = inputPayload.model?.model || localModels[0] || '';
          const isCompatible = MCP_TOOL_CALL_COMPATIBLE_MODELS.some(m => connectedLlmModel.toLowerCase().startsWith(m.split(':')[0]));

          if (!isCompatible && connectedLlmModel) {
            setMcpCompatWarning(`⚠️ Model '${connectedLlmModel}' may not support MCP tool calling. For best results use: mistral:7b, llama3.2:3b, qwen2.5-coder:7b, or gemma2:9b.`);
          } else {
            setMcpCompatWarning(null);
          }

          // Simulated MCP JSON-RPC 2.0 tool call & response
          const mcpRequest = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: { name: selectedTool, arguments: { input: incomingText, ...creds } }
          };

          const mcpResult: Record<string, any> = {
            // Gmail
            send_email: { status: 'sent', messageId: `msg-${Date.now()}`, to: creds.email_address || 'recipient@example.com', subject: 'AI Generated Summary', bodyPreview: incomingText.slice(0, 120) },
            list_inbox: { messages: [{ id: 'msg-001', from: 'noreply@github.com', subject: 'PR #42 merged', snippet: 'Your PR was merged...' }, { id: 'msg-002', from: 'team@slack.com', subject: 'Daily digest', snippet: '5 new messages' }], totalCount: 2 },
            search_emails: { results: [{ id: 'msg-003', from: 'alerts@example.com', subject: 'System alert', snippet: 'CPU usage at 90%...' }], query: incomingText.slice(0, 50) },
            create_draft: { draftId: `draft-${Date.now()}`, subject: 'Draft: ' + incomingText.slice(0, 40), saved: true },
            get_message: { id: 'msg-001', from: 'noreply@example.com', subject: 'Hello', body: incomingText.slice(0, 300), date: new Date().toISOString() },
            // GitHub
            create_issue: { issueUrl: `https://github.com/${creds.repo_name || 'owner/repo'}/issues/99`, number: 99, title: incomingText.slice(0, 60), state: 'open' },
            list_prs: { pullRequests: [{ number: 42, title: 'feat: add MCP tool integration', state: 'merged', author: 'contributor' }] },
            push_file: { sha: 'a1b2c3d', path: 'src/mcp_output.txt', url: `https://github.com/${creds.repo_name || 'owner/repo'}/blob/main/src/mcp_output.txt`, committed: true },
            get_repo_info: { name: creds.repo_name || 'owner/repo', stars: 142, forks: 28, openIssues: 7 },
            create_branch: { branchName: `feature/ai-${Date.now()}`, sha: 'f1e2d3c', created: true },
            merge_pr: { merged: true, prNumber: 42, sha: 'deadbeef' },
            // Slack / Discord / Twilio messaging
            send_message: { ok: true, channel: creds.channel || '#general', timestamp: String(Date.now()), text: incomingText.slice(0, 200) },
            list_channels: { channels: [{ id: 'C001', name: 'general' }, { id: 'C002', name: 'dev' }, { id: 'C003', name: 'ai-hub' }] },
            upload_file: { ok: true, fileId: `file-${Date.now()}`, name: 'ai_output.txt', url: 'https://files.example.com/ai_output.txt' },
            post_reaction: { ok: true, reaction: 'check_mark_button', timestamp: String(Date.now()) },
            list_members: { members: [{ id: 'U001', name: 'alice' }, { id: 'U002', name: 'bob' }] },
            create_channel: { channelId: `ch-${Date.now()}`, name: 'ai-channel', created: true },
            get_members: { members: [{ id: 'U001', username: 'alice', roles: ['member'] }] },
            pin_message: { pinned: true, messageId: `msg-${Date.now()}` },
            delete_message: { deleted: true, messageId: `msg-${Date.now()}` },
            send_sms: { sid: `SM${Date.now()}`, to: '+15550000000', from: creds.twilio_phone || '+15551234567', status: 'sent', body: incomingText.slice(0, 160) },
            send_mms: { sid: `MM${Date.now()}`, to: '+15550000000', status: 'sent' },
            make_call: { callSid: `CA${Date.now()}`, status: 'initiated', duration: 0 },
            list_messages: { messages: [{ sid: 'SM001', body: 'Hello world', status: 'delivered' }] },
            list_calls: { calls: [{ sid: 'CA001', status: 'completed', duration: 45 }] },
            send_whatsapp: { sid: `WA${Date.now()}`, status: 'sent', body: incomingText.slice(0, 200) },
            // Filesystem
            read_file: { content: incomingText.slice(0, 400), path: `${creds.base_path || '/docs'}/output.txt`, size: incomingText.length, encoding: 'utf-8' },
            write_file: { success: true, path: `${creds.base_path || '/docs'}/mcp_result.txt`, bytesWritten: incomingText.length },
            list_directory: { entries: [{ name: 'documents', type: 'directory' }, { name: 'output.txt', type: 'file', size: 2048 }] },
            create_directory: { success: true, path: `${creds.base_path || '/docs'}/new_folder` },
            delete_file: { success: true, path: `${creds.base_path || '/docs'}/old_file.txt` },
            move_file: { success: true, from: `${creds.base_path || '/docs'}/old.txt`, to: `${creds.base_path || '/docs'}/new.txt` },
            // SQL / Postgres
            query: { rows: [{ id: 1, content: incomingText.slice(0, 80), created_at: new Date().toISOString() }], rowCount: 1, query: 'SELECT * FROM documents LIMIT 5' },
            insert_row: { success: true, insertedId: Math.floor(Math.random() * 1000), table: 'documents' },
            update_row: { success: true, updatedCount: 1 },
            delete_row: { success: true, deletedCount: 1 },
            list_tables: { tables: ['users', 'documents', 'embeddings', 'sessions', 'logs'], count: 5 },
            describe_table: { columns: [{ name: 'id', type: 'int' }, { name: 'content', type: 'text' }] },
            // MongoDB
            find_documents: { documents: [{ _id: '64a7b', content: incomingText.slice(0, 100) }], count: 1 },
            insert_document: { insertedId: `64a7c${Date.now()}`, acknowledged: true },
            update_document: { matchedCount: 1, modifiedCount: 1 },
            delete_document: { deletedCount: 1, acknowledged: true },
            aggregate: { result: [{ _id: 'category_a', total: 42 }, { _id: 'category_b', total: 17 }] },
            list_collections: { collections: ['documents', 'users', 'embeddings'], count: 3 },
            create_index: { ok: true, indexName: 'content_text_idx' },
            // Redis
            get: { key: 'mcp:result', value: incomingText.slice(0, 200), ttl: 3600 },
            set: { ok: true, key: 'mcp:result', value: incomingText.slice(0, 200) },
            del: { deleted: 1, key: 'mcp:result' },
            hget: { field: 'content', value: incomingText.slice(0, 100) },
            hset: { ok: true, added: 1 },
            lpush: { length: 1, list: 'mcp:queue' },
            lrange: { items: [incomingText.slice(0, 80), 'previous item'], list: 'mcp:queue' },
            sadd: { added: 1, set: 'mcp:tags' },
            smembers: { members: ['tag1', 'tag2', 'tag3'] },
            publish: { receivers: 3, channel: 'mcp:events' },
            keys: { keys: ['mcp:result', 'mcp:hash', 'mcp:queue'], count: 3 },
            expire: { ok: true, ttl: 3600 },
            ttl: { key: 'mcp:result', ttl: 2847, unit: 'seconds' },
            // Elasticsearch
            search: { hits: [{ _id: '1', _score: 0.98, _source: { content: incomingText.slice(0, 100) } }], total: 1 },
            index_document: { _id: `doc-${Date.now()}`, result: 'created' },
            bulk_index: { took: 12, errors: false, items: [{ index: { _id: '1', result: 'created' } }] },
            // Airtable
            list_records: { records: [{ id: 'recABCD', fields: { Name: incomingText.slice(0, 40), Status: 'Active' } }] },
            create_record: { id: `rec${Date.now()}`, createdTime: new Date().toISOString() },
            update_record: { id: 'recABCD', updatedTime: new Date().toISOString() },
            delete_record: { deleted: true, id: 'recABCD' },
            search_records: { records: [{ id: 'recABCD', fields: { Name: 'Matched Record' } }] },
            // Google Sheets
            read_range: { values: [[incomingText.slice(0, 30), 'Column B'], ['Row 2 A', 'Row 2 B']], range: 'Sheet1!A1:B10' },
            write_range: { updatedRange: 'Sheet1!A1:B2', updatedRows: 2, updatedCells: 4 },
            append_rows: { tableRange: 'Sheet1!A1:B3', updates: { updatedRows: 1 } },
            clear_range: { clearedRange: 'Sheet1!A1:B10' },
            list_sheets: { sheets: [{ sheetId: 0, title: 'Sheet1' }, { sheetId: 1, title: 'Data' }] },
            create_sheet: { sheetId: 2, title: 'AI Generated Sheet' },
            get_spreadsheet_info: { spreadsheetId: creds.spreadsheet_id || 'unknown', title: 'My Spreadsheet', sheetCount: 3 },
            // Google Drive / Dropbox
            list_files: { files: [{ id: 'fileABCD', name: 'document.pdf', modifiedTime: new Date().toISOString() }] },
            get_file: { id: 'fileABCD', name: 'document.pdf', size: 204800 },
            download_file: { content: incomingText.slice(0, 300), mimeType: 'text/plain' },
            share_file: { id: 'fileABCD', shared: true, link: 'https://drive.google.com/file/d/fileABCD/view?usp=sharing' },
            create_folder: { id: `folder-${Date.now()}`, name: 'AI Generated Folder' },
            create_shared_link: { url: 'https://www.dropbox.com/s/xxxx/file.txt?dl=0' },
            // SendGrid
            send_template_email: { messageId: `sendgrid-tmpl-${Date.now()}`, statusCode: 202 },
            list_templates: { templates: [{ id: 'd-00001', name: 'Welcome Email' }, { id: 'd-00002', name: 'Order Confirmation' }] },
            get_email_stats: { date: new Date().toISOString().split('T')[0], delivered: 142, opens: 89, clicks: 31 },
            manage_contacts: { jobId: `job-${Date.now()}`, status: 'queued' },
            create_template: { id: `d-${Date.now()}`, name: incomingText.slice(0, 30) },
            // Notion
            get_page: { id: creds.page_id || 'page-xxxx', title: incomingText.slice(0, 40), url: 'https://notion.so/page-xxxx' },
            create_page: { id: `page-${Date.now()}`, title: incomingText.slice(0, 40), created: true },
            update_page: { id: creds.page_id || 'page-xxxx', updated: true },
            query_database: { results: [{ id: 'db-001', properties: { Name: incomingText.slice(0, 40), Status: 'Done' } }] },
            append_block: { blockId: `block-${Date.now()}`, text: incomingText.slice(0, 200), appended: true },
            search_pages: { results: [{ id: 'page-001', title: incomingText.slice(0, 30) }] },
            // Linear
            list_issues: { issues: [{ id: 'LIN-001', title: 'Fix MCP integration', state: 'In Progress' }, { id: 'LIN-002', title: 'Add templates', state: 'Todo' }] },
            update_issue: { id: 'LIN-001', updated: true, state: 'Done' },
            list_projects: { projects: [{ id: 'proj-001', name: 'AI Hub Development', progress: 0.65 }] },
            list_teams: { teams: [{ id: 'team-001', name: 'Engineering', members: 5 }] },
            create_comment: { id: `comment-${Date.now()}`, body: incomingText.slice(0, 200), issueId: 'LIN-001' },
            // Twitter/X
            post_tweet: { id: `tweet-${Date.now()}`, text: incomingText.slice(0, 280), created_at: new Date().toISOString() },
            search_tweets: { data: [{ id: 'tweet-001', text: incomingText.slice(0, 100) }], meta: { result_count: 1 } },
            get_timeline: { data: [{ id: 'tweet-002', text: 'Latest tweet from timeline' }] },
            get_mentions: { data: [{ id: 'tweet-003', text: incomingText.slice(0, 80) }] },
            like_tweet: { liked: true, tweet_id: 'tweet-001' },
            get_user_info: { id: 'user-001', name: 'AI Bot', username: 'aibot', public_metrics: { followers_count: 1240 } },
            // YouTube
            search_videos: { items: [{ videoId: 'dQw4w9WgXcQ', title: incomingText.slice(0, 50), channel: 'AI Channel', views: '142K' }] },
            get_video_details: { videoId: 'dQw4w9WgXcQ', title: 'AI Video', description: incomingText.slice(0, 200), views: 142000 },
            list_channel_videos: { videos: [{ videoId: 'abc123', title: 'Tutorial 1' }] },
            get_channel_stats: { channelId: 'UC-001', subscriberCount: 15200, videoCount: 89 },
            list_playlists: { playlists: [{ id: 'PL-001', title: 'AI Tutorials', videoCount: 12 }] },
            get_comments: { items: [{ commentId: 'cm-001', text: 'Great video!', likes: 42 }] },
            // Shopify
            list_products: { products: [{ id: `prod-${Date.now()}`, title: incomingText.slice(0, 40), price: '29.99', status: 'active' }] },
            create_product: { id: `prod-${Date.now()}`, title: incomingText.slice(0, 40), status: 'active' },
            get_orders: { orders: [{ id: `order-${Date.now()}`, totalPrice: '89.97', status: 'paid', itemCount: 3 }] },
            update_order: { id: `order-${Date.now()}`, status: 'fulfilled' },
            list_customers: { customers: [{ id: 'cust-001', email: 'customer@example.com', totalOrders: 5 }] },
            get_inventory: { inventoryItemId: 'inv-001', available: 142, committed: 8 },
            // Stripe
            stripe_list_customers: { data: [{ id: 'cus_xxx', email: 'customer@example.com' }], has_more: false },
            get_customer: { id: 'cus_xxx', email: 'customer@example.com', subscriptions: { total_count: 1 } },
            list_payments: { data: [{ id: 'pi_xxx', amount: 2999, currency: 'usd', status: 'succeeded' }] },
            create_payment: { id: `pi_${Date.now()}`, amount: 2999, currency: 'usd', status: 'succeeded' },
            list_invoices: { data: [{ id: 'in_xxx', amount_due: 2999, status: 'paid' }] },
            create_refund: { id: `re_${Date.now()}`, amount: 2999, status: 'succeeded' },
            list_subscriptions: { data: [{ id: 'sub_xxx', status: 'active', customer: 'cus_xxx' }] },
            // AI APIs
            generate_text: { content: [{ type: 'text', text: `Claude response: ${incomingText.slice(0, 200)}` }], model: creds.claude_model || 'claude-3-5-sonnet-20241022', usage: { input_tokens: 45, output_tokens: 120 } },
            analyze_image: { description: 'Image contains UI elements and text consistent with a software interface.', confidence: 0.97 },
            summarize_document: { summary: incomingText.slice(0, 150), wordCount: Math.round(incomingText.length / 5) },
            code_review: { issues: [{ severity: 'info', line: 42, message: 'Consider extracting this into a function' }], score: 88 },
            extract_data: { extracted: { title: incomingText.slice(0, 40), entities: ['AI', 'MCP', 'DomoDomo'] } },
            classify_text: { label: 'technical', confidence: 0.94 },
            chat_completion: { id: `chatcmpl-${Date.now()}`, choices: [{ message: { role: 'assistant', content: `GPT: ${incomingText.slice(0, 200)}` }, finish_reason: 'stop' }], model: creds.openai_model || 'gpt-4o-mini', usage: { total_tokens: 165 } },
            create_embedding: { object: 'list', data: [{ embedding: Array.from({ length: 8 }, () => Math.random() - 0.5), index: 0 }], model: 'text-embedding-3-small' },
            generate_image: { created: Math.floor(Date.now() / 1000), data: [{ url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/sample.png', revised_prompt: incomingText.slice(0, 100) }] },
            transcribe_audio: { text: 'Transcribed: ' + incomingText.slice(0, 150), language: 'en', duration: 12.4 },
            moderate_content: { id: `modr-${Date.now()}`, results: [{ flagged: false, categories: { hate: false, violence: false }, category_scores: { hate: 0.001 } }] },
            fine_tune_status: { id: `ftjob-${Date.now()}`, status: 'succeeded', model: 'gpt-3.5-turbo' },
            // HuggingFace
            run_inference: { output: incomingText.slice(0, 200), model: 'mistralai/Mistral-7B-Instruct-v0.1', tokens_used: Math.round(incomingText.length / 4) },
            list_models: { models: ['mistralai/Mistral-7B-Instruct-v0.1', 'meta-llama/Llama-2-7b-chat-hf', 'google/gemma-2b-it'], total: 3 },
            get_model_info: { id: 'mistralai/Mistral-7B-Instruct-v0.1', likes: 14200, downloads: 8900000, pipeline_tag: 'text-generation' },
            run_embedding: { embeddings: Array.from({ length: 8 }, () => Math.random() - 0.5), model: 'sentence-transformers/all-MiniLM-L6-v2' },
            text_classification: { labels: ['POSITIVE', 'NEGATIVE'], scores: [0.94, 0.06] },
            // Weather
            get_current_weather: { city: 'Manila', country: 'PH', temperature: 32, feels_like: 38, humidity: 78, description: 'Partly cloudy', wind_speed: 4.2 },
            get_forecast: { city: 'Manila', forecast: [{ date: new Date().toISOString().split('T')[0], high: 33, low: 26, description: 'Partly cloudy', rain_prob: 0.3 }] },
            get_air_quality: { aqi: 42, category: 'Good', pm2_5: 8.4, pm10: 15.2 },
            get_historical_weather: { city: 'Manila', avg_temp: 30.5, rainfall: 0, sunshine_hours: 7.2 },
            search_location: { results: [{ name: 'Manila', country: 'PH', lat: 14.5995, lon: 120.9842 }] },
            get_alerts: { alerts: [], message: 'No active weather alerts' },
            // Supabase
            select_rows: { data: [{ id: 1, content: incomingText.slice(0, 80), created_at: new Date().toISOString() }], count: 1, status: 200 },
            insert_rows: { data: [{ id: Math.floor(Math.random() * 9000) + 1000, created_at: new Date().toISOString() }], status: 201 },
            update_rows: { data: [{ id: 1, updated_at: new Date().toISOString() }], count: 1, status: 200 },
            delete_rows: { data: [], count: 1, status: 200 },
            run_sql: { data: [{ id: 1, result: incomingText.slice(0, 60) }], rowCount: 1 },
            list_users: { users: [{ id: 'user-001', email: 'user@example.com', created_at: new Date().toISOString() }] },
            invoke_function: { data: { result: incomingText.slice(0, 200), executionTime: 142 }, status: 200 },
            // Jira
            get_issue: { key: 'PROJ-99', summary: incomingText.slice(0, 60), status: { name: 'In Progress' }, priority: { name: 'High' } },
            jira_list_projects: { projects: [{ key: 'PROJ', name: 'Main Project', projectTypeKey: 'software' }] },
            search_issues: { issues: [{ key: 'PROJ-99', summary: incomingText.slice(0, 60), status: 'Open' }], total: 1 },
            add_comment: { id: `comment-${Date.now()}`, body: incomingText.slice(0, 200), created: true },
            assign_issue: { key: 'PROJ-99', assigned: true },
            transition_issue: { key: 'PROJ-99', transitioned: true, newStatus: 'Done' },
            // Custom MCP
            call_tool: { result: incomingText.slice(0, 300), toolName: selectedTool, server: creds.url || 'localhost:3001' },
            list_tools: { tools: ['custom_tool_1', 'custom_tool_2', 'process_data'], server: creds.url || 'localhost:3001' },
            get_schema: { schema: { type: 'object', properties: { input: { type: 'string' } } }, server: creds.url || 'localhost:3001' },
            ping: { status: 'ok', server: creds.url || 'localhost:3001', latency_ms: Math.floor(Math.random() * 30) + 5 }
          };

          const toolResult = mcpResult[selectedTool] || { result: `Executed ${selectedTool} successfully`, data: incomingText.slice(0, 200) };

          inputPayload = { mcpRequest, serverType: serverKey, tool: selectedTool };
          outputPayload = {
            _simulated: true,
            mcpServer: serverDef.label,
            tool: selectedTool,
            toolResult,
            mcpRequest,
            mcpResponse: { jsonrpc: '2.0', id: mcpRequest.id, result: { content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }] } }
          };
        } else if (node.type === 'webhook') {
          const msgToSend = inputPayload.in?.response || finalAgentResponseText || 'Automated message dispatched via webhook.';
          inputPayload = { message: msgToSend, targetChannel: node.config.channel || '#marketing' };
          outputPayload = {
            status: 200,
            channel: node.config.channel || '#marketing',
            delivered: true,
            payloadSize: msgToSend.length
          };
        } else if (node.type === 'formatter') {
          const rawText = inputPayload.in?.response || finalAgentResponseText || 'Sample payload';
          inputPayload = { inputLength: rawText.length };
          outputPayload = {
            formattedJson: { result: rawText, cleanMarkdown: true, timestamp: new Date().toISOString() }
          };
        } else if (node.type === 'export') {
          const contentToExport = inputPayload.in?.response || finalAgentResponseText || 'Processed Document RAG Output';
          const fileName = node.config.fileName || 'rag_summary.md';
          inputPayload = { exportTarget: fileName, size: contentToExport.length };
          outputPayload = {
            fileName,
            bytesWritten: contentToExport.length,
            status: 'ready_for_download',
            content: contentToExport
          };
        } else {
          outputPayload = { status: 'processed', nodeType: node.type };
        }
      } catch (err: any) {
        outputPayload = { error: err.message || String(err) };
      }

      const elapsed = Math.round(performance.now() - startTime + 180 + Math.random() * 250);
      nodeResults.set(node.id, outputPayload);

      logs.push({
        nodeId: node.id,
        title: node.title,
        timeMs: elapsed,
        status: 'completed',
        payload: outputPayload
      });

      updateActiveWorkflow(w => ({
        ...w,
        nodes: w.nodes.map(n => n.id === node.id ? { ...n, status: 'completed', executionTimeMs: elapsed, lastOutput: outputPayload } : n)
      }));

      await new Promise(r => setTimeout(r, 300));
    }

    setExecutionLogs(logs);
    setIsExecuting(false);
    setIsSaved(true);

    if (finalAgentResponseText) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: finalAgentResponseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }

    if (onRunWorkflow) {
      onRunWorkflow(JSON.stringify(logs, null, 2));
    }
  };

  // Download Output Artifact Helper
  const handleDownloadOutputArtifact = (payload: any) => {
    const textContent = payload.content || JSON.stringify(payload, null, 2);
    const fileName = payload.fileName || 'workflow_export.txt';
    triggerBlobDownload(new Blob([textContent], { type: 'text/plain;charset=utf-8' }), fileName);
  };

  // Send Chat Message in Bottom Panel
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setChatInput('');
    handleExecuteWorkflow();
  };

  // New Workflow Creator
  const handleCreateNewWorkflow = () => {
    const newId = `wf-${Date.now()}`;
    const newWf: WorkflowPreset = {
      id: newId,
      name: 'New Document & AI Pipeline',
      tag: 'automation',
      description: 'Custom interactive node automation pipeline.',
      active: true,
      nodes: [
        {
          id: `doc-${Date.now()}`,
          type: 'document_upload',
          title: 'Document & Data Ingestion',
          category: 'Data Ingestion',
          iconName: 'FileText',
          color: '#A855F7',
          x: 120,
          y: 240,
          status: 'idle',
          config: {},
          inputs: [],
          outputs: [{ id: 'out', name: 'Document Text', type: 'output', label: '1 file' }]
        }
      ],
      connections: []
    };
    setWorkflows(prev => [newWf, ...prev]);
    setActiveWorkflowId(newId);
  };

  // Export Workflow JSON
  const handleExportWorkflowJson = () => {
    triggerBlobDownload(
      new Blob([JSON.stringify(activeWorkflow, null, 2)], { type: 'application/json' }),
      `${activeWorkflow.name.toLowerCase().replace(/\s+/g, '_')}_workflow.json`
    );
  };

  const renderIcon = (iconName: string, color: string, size = 16) => {
    switch (iconName) {
      case 'FileText': return <FileText size={size} style={{ color }} />;
      case 'Upload': return <Upload size={size} style={{ color }} />;
      case 'Zap': return <Zap size={size} style={{ color }} />;
      case 'Bot': return <Bot size={size} style={{ color }} />;
      case 'Cpu': return <Cpu size={size} style={{ color }} />;
      case 'Database': return <Database size={size} style={{ color }} />;
      case 'Code': return <Code size={size} style={{ color }} />;
      case 'MessageSquare': return <MessageSquare size={size} style={{ color }} />;
      case 'Layers': return <Layers size={size} style={{ color }} />;
      case 'Sparkles': return <Sparkles size={size} style={{ color }} />;
      case 'Search': return <Search size={size} style={{ color }} />;
      case 'Download': return <Download size={size} style={{ color }} />;
      case 'Shield': return <Shield size={size} style={{ color }} />;
      case 'Globe': return <Globe size={size} style={{ color }} />;
      case 'Mail': return <Mail size={size} style={{ color }} />;
      case 'Workflow': return <Workflow size={size} style={{ color }} />;
      case 'Server': return <Server size={size} style={{ color }} />;
      case 'Eye': return <Eye size={size} style={{ color }} />;
      default: return <Cpu size={size} style={{ color }} />;
    }
  };

  // Global Canvas Drag & Drop File Ingestion Handler
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    let targetNode = nodes.find(n => n.type === 'document_upload' || n.type === 'trigger' || n.id.includes('doc') || n.title.toLowerCase().includes('document') || n.title.toLowerCase().includes('input'));

    if (targetNode) {
      handleFileUpload(targetNode.id, file);
      setSelectedNodeId(targetNode.id);
    } else {
      const newId = `doc-${Date.now()}`;
      const newNode: FlowNode = {
        id: newId,
        type: 'document_upload',
        title: 'Document & Data Ingestion',
        subtitle: file.name,
        category: 'Data Ingestion',
        iconName: 'FileText',
        color: '#A855F7',
        x: 180,
        y: 200,
        status: 'idle',
        config: { fileName: file.name, fileSize: file.size },
        inputs: [],
        outputs: [{ id: 'out', name: 'Document Text', type: 'output', label: '1 file' }]
      };
      updateActiveWorkflow(w => ({ ...w, nodes: [...w.nodes, newNode] }));
      handleFileUpload(newId, file);
      setSelectedNodeId(newId);
    }
  };

  // Rich Markdown & Text Formatting Renderer for Chat Console
  const renderFormattedChatMessage = (text: string, isUser = false) => {
    if (!text) return null;

    const textColorClass = isUser ? 'text-white' : 'text-[#ECEBE9]';
    const headingColorClass = isUser ? 'text-emerald-200 font-extrabold' : 'text-[#3C6B4D] font-extrabold';
    const bulletColorClass = isUser ? 'text-emerald-200 font-bold' : 'text-[#3C6B4D] font-bold';

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      let trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={`blank-${idx}`} className="h-1" />);
        return;
      }

      // Check if line is a bullet point (starts with * or - or •)
      const isBullet = /^[\*\-\•]\s+/.test(trimmed);
      if (isBullet) {
        trimmed = trimmed.replace(/^[\*\-\•]\s+/, '');
      }

      // Parse bold **text** and inline `code`
      const parts: React.ReactNode[] = [];
      const regex = /(\*\*.*?\*\*|`.*?`)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(trimmed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(trimmed.substring(lastIndex, match.index));
        }
        const token = match[0];
        if (token.startsWith('**') && token.endsWith('**')) {
          parts.push(
            <strong key={`b-${match.index}`} className={`font-extrabold ${isUser ? 'text-white' : 'text-[#ECEBE9]'}`}>
              {token.slice(2, -2)}
            </strong>
          );
        } else if (token.startsWith('`') && token.endsWith('`')) {
          parts.push(
            <code key={`c-${match.index}`} className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
              isUser ? 'bg-[#18191B]/60 border border-white/20 text-emerald-200' : 'bg-[#18191B] border border-[#2A2D30] text-[#10A37F]'
            }`}>
              {token.slice(1, -1)}
            </code>
          );
        }
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < trimmed.length) {
        parts.push(trimmed.substring(lastIndex));
      }

      if (isBullet) {
        elements.push(
          <div key={`bullet-${idx}`} className="flex items-start gap-2 my-1 pl-1">
            <span className={`${bulletColorClass} text-sm shrink-0 leading-none mt-0.5`}>•</span>
            <div className={`flex-1 text-xs ${textColorClass} leading-relaxed`}>{parts}</div>
          </div>
        );
      } else if (trimmed.startsWith('###')) {
        elements.push(
          <h4 key={`h3-${idx}`} className={`text-xs ${headingColorClass} mt-2 mb-1 uppercase tracking-wide`}>
            {trimmed.replace(/^###\s*/, '')}
          </h4>
        );
      } else {
        elements.push(
          <p key={`p-${idx}`} className={`text-xs ${textColorClass} leading-relaxed my-0.5`}>
            {parts}
          </p>
        );
      }
    });

    return <div className="space-y-1">{elements}</div>;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] max-h-[920px] w-full bg-[#111213] text-[#ECEBE9] font-sans rounded-3xl border border-[#2A2D30] overflow-hidden select-none relative">
      {/* ── TOP HEADER / NAVIGATION ── */}
      <div className="flex flex-wrap items-center justify-between px-3 md:px-5 py-2.5 bg-[#18191B] border-b border-[#2A2D30] z-20 gap-2 md:gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="p-1.5 md:p-2 rounded-xl bg-[#3C6B4D]/20 text-[#3C6B4D] border border-[#3C6B4D]/30 shrink-0">
            <Layers size={16} />
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-wrap">
            {/* Workflow Preset Selector */}
            <select
              value={activeWorkflowId}
              onChange={e => setActiveWorkflowId(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-2.5 py-1.5 text-xs text-[#ECEBE9] font-bold focus:outline-none focus:border-[#3C6B4D] truncate max-w-[160px] sm:max-w-[240px] md:max-w-[340px]"
            >
              {workflows.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.nodes.length} nodes)</option>
              ))}
            </select>

            <button onClick={handleCreateNewWorkflow} className="p-1.5 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] transition-all shrink-0" title="Create New Workflow">
              <Plus size={14} />
            </button>

            <span className="hidden xl:inline-block text-[10px] font-bold text-[#A3A09B] bg-[#111213] px-2 py-0.5 rounded-full border border-[#2A2D30] shrink-0 font-mono uppercase">
              {activeWorkflow.tag}
            </span>

            <span className="hidden sm:inline-block text-[10px] font-mono text-[#72706C] shrink-0">
              {isSaved ? '• Saved' : '• Unsaved'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 shrink-0 flex-wrap justify-end">
          <div className="hidden sm:flex items-center p-0.5 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs font-bold">
            {(['editor', 'executions', 'tests'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all text-xs ${
                  mode === tab ? 'bg-[#18191B] text-[#ECEBE9] shadow-sm' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-2 py-1 text-xs">
            <span className="text-[10px] font-bold text-[#72706C] hidden xs:inline">Active</span>
            <button
              onClick={() => updateActiveWorkflow(w => ({ ...w, active: !w.active }))}
              className={`w-7 h-4 rounded-full p-0.5 transition-colors ${activeWorkflow.active ? 'bg-[#3C6B4D]' : 'bg-[#2A2D30]'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${activeWorkflow.active ? 'translate-x-3' : 'translate-x-0'}`} />
            </button>
          </div>

          <button onClick={handleExportWorkflowJson} className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] hover:border-[#3C6B4D] text-xs font-bold rounded-xl transition-all">
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <button
            onClick={handleExecuteWorkflow}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 bg-[#E05D52] hover:bg-[#c94d43] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all shadow-md shadow-[#E05D52]/20 shrink-0"
            title={isExecuting ? 'Locked: Executing flow...' : 'Test workflow'}
          >
            {isExecuting ? <Lock size={13} className="animate-spin text-white" /> : <Play size={13} />}
            <span>{isExecuting ? 'Executing...' : 'Test workflow'}</span>
          </button>

          <button
            onClick={() => setShowBottomPanel(!showBottomPanel)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
              showBottomPanel ? 'bg-[#111213] border-[#3C6B4D] text-[#3C6B4D]' : 'bg-[#111213] border-[#2A2D30] text-[#72706C]'
            }`}
          >
            {showBottomPanel ? 'Hide chat' : 'Show chat'}
          </button>
        </div>
      </div>

      {/* ── CANVAS WORKSPACE AREA ── */}
      <div
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={e => e.preventDefault()}
        onDrop={handleCanvasDrop}
        className="flex-1 relative overflow-hidden bg-[#111213] cursor-grab active:cursor-grabbing"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(#2A2D30 1.5px, transparent 1.5px)`,
            backgroundSize: `${24 * scale}px ${24 * scale}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />

        {/* SVG Bezier Connection Lines Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          style={{
            overflow: 'visible',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.fromNodeId);
            if (!fromNode) return null;

            const p1 = getPortCoords(conn.fromNodeId, conn.fromPortId, true);
            const p2 = getPortCoords(conn.toNodeId, conn.toPortId, false);

            const dx = Math.max(Math.abs(p2.x - p1.x) * 0.5, 40);
            const pathData = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;

            return (
              <g key={conn.id} className="pointer-events-auto">
                <path
                  d={pathData}
                  fill="none"
                  stroke={fromNode.color}
                  strokeWidth={3}
                  strokeOpacity={0.2}
                />
                <path
                  d={pathData}
                  fill="none"
                  stroke={fromNode.color}
                  strokeWidth={2.2}
                  strokeDasharray={fromNode.status === 'running' ? '6 3' : undefined}
                  className={fromNode.status === 'running' ? 'animate-dash' : ''}
                  onClick={() => handleRemoveConnection(conn.id)}
                />
                {conn.label && (
                  <g transform={`translate(${(p1.x + p2.x) / 2}, ${(p1.y + p2.y) / 2})`}>
                    <rect x={-24} y={-10} width={48} height={20} rx={10} fill="#18191B" stroke="#2A2D30" strokeWidth={1} />
                    <text x={0} y={3} textAnchor="middle" fill="#A3A09B" fontSize={9} fontWeight="bold" fontFamily="sans-serif">
                      {conn.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Live Dragging Connection Cable Preview */}
          {wiringFrom && (
            (() => {
              const p1 = getPortCoords(wiringFrom.nodeId, wiringFrom.portId, true);
              const p2 = mouseCanvasPos;
              const dx = Math.max(Math.abs(p2.x - p1.x) * 0.5, 40);
              const pathData = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;
              return (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#3C6B4D"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              );
            })()
          )}
        </svg>

        {/* Nodes Canvas Container */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isDeactivated = node.status === 'deactivated';
            const isDocUpload = node.type === 'document_upload';

            return (
              <div
                key={node.id}
                onMouseDown={e => handleNodeMouseDown(e, node.id)}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={`absolute pointer-events-auto w-64 rounded-2xl border bg-[#18191B] shadow-2xl transition-all ${
                  isSelected ? 'border-[#3C6B4D] ring-2 ring-[#3C6B4D]/30' : 'border-[#2A2D30]'
                } ${isDeactivated ? 'opacity-50' : ''}`}
              >
                {/* Node Card Header */}
                <div className="p-3 flex items-center justify-between border-b border-[#2A2D30]/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-xl bg-[#111213] border border-[#2A2D30] shrink-0">
                      {renderIcon(node.iconName, node.color, 15)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#ECEBE9] truncate leading-tight">{node.title}</p>
                      <p className="text-[10px] font-medium text-[#72706C] truncate">{node.subtitle || node.category}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    {node.status === 'completed' && <CheckCircle size={14} className="text-emerald-500" />}
                    {node.status === 'running' && <span className="w-2.5 h-2.5 rounded-full bg-[#3C6B4D] animate-ping" />}
                    {node.status === 'deactivated' && <span className="text-[9px] text-[#72706C] font-mono">(Deactivated)</span>}
                  </div>
                </div>

                {/* Node Body & Inline Document Uploader */}
                <div className="p-3 space-y-2 relative">
                  {(isDocUpload || node.type === 'trigger' || node.id.includes('doc') || node.title.toLowerCase().includes('document') || node.title.toLowerCase().includes('input')) && (
                    <label className="block p-2.5 bg-[#111213] border border-dashed border-[#A855F7]/60 hover:border-[#A855F7] rounded-xl text-center cursor-pointer transition-colors group">
                      <Upload size={14} className="mx-auto text-[#A855F7] mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-[#ECEBE9] block truncate">
                        {node.config.fileName ? `📄 ${node.config.fileName}` : '📁 Upload PDF / Text Data'}
                      </span>
                      <span className="text-[9px] text-[#72706C] block">(.pdf, .txt, .json, .csv, .docx)</span>
                      <input
                        type="file"
                        accept=".txt,.json,.csv,.md,.pdf,.docx"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(node.id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  )}

                  {/* Inputs List */}
                  {node.inputs.length > 0 && (
                    <div className="space-y-1.5">
                      {node.inputs.map(port => (
                        <div key={port.id} className="flex items-center gap-2 text-[10px] font-bold text-[#72706C] relative">
                          <button
                            onClick={e => handlePortClick(e, node.id, port.id, 'input')}
                            className="w-3.5 h-3.5 -ml-4 rounded-full bg-[#111213] border-2 border-[#3C6B4D] hover:scale-125 transition-transform shrink-0"
                            title={`Connect Input: ${port.name}`}
                          />
                          <span className="truncate">{port.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Outputs List */}
                  {node.outputs.length > 0 && (
                    <div className="flex justify-end space-y-1.5">
                      {node.outputs.map(port => (
                        <div key={port.id} className="flex items-center gap-2 text-[10px] font-bold text-[#72706C] relative">
                          <span className="truncate">{port.label || port.name}</span>
                          <button
                            onClick={e => handlePortClick(e, node.id, port.id, 'output')}
                            className="w-3.5 h-3.5 -mr-4 rounded-full bg-[#3C6B4D] border-2 border-white hover:scale-125 transition-transform shrink-0"
                            title={`Connect Output: ${port.name}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {node.executionTimeMs && (
                    <div className="pt-1 text-[9px] font-mono text-[#3C6B4D] flex items-center justify-between border-t border-[#2A2D30]/40">
                      <span>Execution Time:</span>
                      <span>{node.executionTimeMs}ms</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── LEFT FLOATING NODE PALETTE BAR ── */}
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-2 bg-[#18191B] border border-[#2A2D30] p-2 rounded-2xl shadow-xl">
          <button onClick={() => setShowAddNodeModal(true)} className="p-2 hover:bg-[#111213] rounded-xl text-[#ECEBE9] transition-all group relative" title="Search & Add Node (Shift+A)">
            <Plus size={16} />
          </button>
          <button onClick={() => handleAddNode('document_upload')} className="p-2 hover:bg-[#111213] rounded-xl text-purple-400 transition-all group relative" title="Add Document Ingestion Node">
            <FileText size={16} />
          </button>
          <button onClick={() => handleAddNode('trigger')} className="p-2 hover:bg-[#111213] rounded-xl text-amber-400 transition-all group relative" title="Add Trigger Node">
            <Zap size={16} />
          </button>
          <button onClick={() => handleAddNode('agent')} className="p-2 hover:bg-[#111213] rounded-xl text-[#3C6B4D] transition-all group relative" title="Add AI Agent">
            <Bot size={16} />
          </button>
          <button onClick={() => handleAddNode('llm')} className="p-2 hover:bg-[#111213] rounded-xl text-emerald-400 transition-all group relative" title="Add Local LLM">
            <Cpu size={16} />
          </button>
          <button onClick={() => handleAddNode('vector_store')} className="p-2 hover:bg-[#111213] rounded-xl text-red-400 transition-all group relative" title="Add Vector Store">
            <Layers size={16} />
          </button>
          <button onClick={() => handleAddNode('tool')} className="p-2 hover:bg-[#111213] rounded-xl text-blue-400 transition-all group relative" title="Add Tool">
            <Search size={16} />
          </button>
          <button onClick={() => handleAddNode('mcp_tool')} className="p-2 hover:bg-[#111213] rounded-xl text-[#3C6B4D] transition-all group relative border border-[#3C6B4D]/30" title="Add MCP Tool Node">
            <Shield size={16} />
          </button>
          <button onClick={() => handleAddNode('export')} className="p-2 hover:bg-[#111213] rounded-xl text-amber-500 transition-all group relative" title="Add File Exporter">
            <Download size={16} />
          </button>
        </div>

        {/* ── BOTTOM LEFT ZOOM / VIEWPORT CONTROLS ── */}
        <div className="absolute left-4 bottom-4 z-20 flex items-center gap-1.5 bg-[#18191B] border border-[#2A2D30] p-1.5 rounded-2xl shadow-xl">
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-[#111213] rounded-xl text-[#72706C] hover:text-[#ECEBE9] transition-all" title="Zoom In (+)">
            <ZoomIn size={14} />
          </button>
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-[#111213] rounded-xl text-[#72706C] hover:text-[#ECEBE9] transition-all" title="Zoom Out (-)">
            <ZoomOut size={14} />
          </button>
          <button onClick={handleResetZoom} className="p-1.5 hover:bg-[#111213] rounded-xl text-[#72706C] hover:text-[#ECEBE9] transition-all" title="Reset Zoom (100%)">
            <RotateCcw size={14} />
          </button>
          <button onClick={handleFitView} className="p-1.5 hover:bg-[#111213] rounded-xl text-[#3C6B4D] hover:text-emerald-400 transition-all" title="Fit View to Screen">
            <Maximize2 size={14} />
          </button>
          <span className="px-2 text-[10px] font-mono font-bold text-[#3C6B4D]">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>

      {/* ── RESIZABLE BOTTOM PANEL ── */}
      {showBottomPanel && (
        <div
          style={{ height: `${panelHeight}px` }}
          className="bg-[#18191B] border-t border-[#2A2D30] z-20 flex flex-col shrink-0 relative transition-all duration-75"
        >
          {/* DRAG-TO-RESIZE TOP HANDLE BAR */}
          <div
            onMouseDown={handleResizePanelStart}
            onDoubleClick={() => setPanelHeight(panelHeight === 270 ? 460 : 270)}
            className="h-2.5 bg-[#111213] hover:bg-[#3C6B4D]/40 cursor-row-resize flex items-center justify-center group transition-colors shrink-0 border-b border-[#2A2D30]"
            title="Drag up/down to resize chat console height (Double click to toggle expand)"
          >
            <div className="w-12 h-1 rounded-full bg-[#2A2D30] group-hover:bg-[#3C6B4D] transition-colors" />
          </div>

          {/* Bottom Panel Header Tabs & Controls */}
          <div className="flex items-center justify-between px-5 py-2 bg-[#111213] border-b border-[#2A2D30] text-xs">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setBottomPanelTab('chat')}
                className={`font-bold flex items-center gap-2 pb-1 border-b-2 transition-all ${
                  bottomPanelTab === 'chat' ? 'border-[#3C6B4D] text-[#ECEBE9]' : 'border-transparent text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                <MessageSquare size={13} />
                <span>Chat Console</span>
                <span className="text-[10px] font-mono text-[#72706C]">(Session b6ff428b)</span>
              </button>

              <button
                onClick={() => setBottomPanelTab('logs')}
                className={`font-bold flex items-center gap-2 pb-1 border-b-2 transition-all ${
                  bottomPanelTab === 'logs' ? 'border-[#3C6B4D] text-[#ECEBE9]' : 'border-transparent text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                <Terminal size={13} />
                <span>Latest Logs &amp; Payload Inspector</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border-r border-[#2A2D30] pr-2">
                <button onClick={() => setPanelHeight(150)} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#18191B] text-[#72706C] hover:text-[#ECEBE9]" title="Compact Height (150px)">
                  150px
                </button>
                <button onClick={() => setPanelHeight(270)} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#18191B] text-[#72706C] hover:text-[#ECEBE9]" title="Default Height (270px)">
                  270px
                </button>
                <button onClick={() => setPanelHeight(480)} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#18191B] text-[#72706C] hover:text-[#ECEBE9]" title="Expanded Height (480px)">
                  480px
                </button>
              </div>

              <button onClick={() => setExecutionLogs([])} className="p-1 text-[#72706C] hover:text-red-400" title="Clear Logs">
                <Trash2 size={13} />
              </button>
              <button onClick={() => setShowBottomPanel(false)} className="p-1 text-[#72706C] hover:text-[#ECEBE9]">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Bottom Panel Content Split */}
          <div className="flex-1 flex overflow-hidden">
            {bottomPanelTab === 'chat' ? (
              <div className="flex-1 flex flex-col p-3 min-w-0">
                <div className="flex-1 overflow-y-auto space-y-3 font-sans text-xs pr-2">
                  {chatMessages.map((msg, i) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div
                          style={{
                            backgroundColor: isUser ? '#1E3A2B' : '#111213',
                            color: '#ECEBE9',
                            borderColor: isUser ? 'rgba(60, 107, 77, 0.6)' : '#2A2D30'
                          }}
                          className={`max-w-[80%] rounded-2xl p-3 border shadow-md ${
                            isUser ? 'rounded-tr-xs' : 'rounded-tl-xs'
                          }`}
                        >
                          <div className="leading-relaxed">{renderFormattedChatMessage(msg.text, isUser)}</div>
                          <span className={`text-[9px] font-mono block mt-1 text-right ${isUser ? 'text-emerald-200/70' : 'text-[#72706C]'}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Type a test query about the uploaded document..."
                    className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-4 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                  />
                  <button onClick={handleSendChatMessage} className="p-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden font-mono text-xs">
                <div className="w-64 bg-[#111213] border-r border-[#2A2D30] p-3 overflow-y-auto space-y-1.5 shrink-0">
                  {executionLogs.map(log => {
                    const isSel = selectedLogNodeId === log.nodeId;
                    return (
                      <button
                        key={log.nodeId}
                        onClick={() => setSelectedLogNodeId(log.nodeId)}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-all ${
                          isSel ? 'bg-[#18191B] border border-[#3C6B4D] text-[#ECEBE9]' : 'hover:bg-[#18191B]/50 text-[#72706C]'
                        }`}
                      >
                        <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                        <span className="truncate font-bold text-[11px] flex-1">{log.title}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-[#18191B] space-y-3">
                  {(() => {
                    const currentLog = executionLogs.find(l => l.nodeId === selectedLogNodeId) || executionLogs[0];
                    if (!currentLog) return <p className="text-[#72706C]">No execution logs recorded yet.</p>;

                    const hasExportableArtifact = currentLog.payload?.content || currentLog.payload?.fileName;

                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
                          <span className="font-bold text-[#3C6B4D] text-xs">
                            {currentLog.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {hasExportableArtifact && (
                              <button
                                onClick={() => handleDownloadOutputArtifact(currentLog.payload)}
                                className="px-3 py-1 bg-[#D97706] hover:bg-[#b46204] text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all"
                              >
                                <Download size={12} />
                                <span>Download Output Artifact</span>
                              </button>
                            )}
                            <span className="text-[10px] text-[#72706C]">
                              {currentLog.timeMs}ms | Execution Log
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] text-[#72706C] uppercase font-bold">Node Output Payload JSON</span>
                          <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-[11px] text-emerald-400 leading-relaxed overflow-x-auto">
                            {JSON.stringify(currentLog.payload, null, 2)}
                          </pre>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SEARCHABLE ADD NODE MODAL ── */}
      {showAddNodeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#18191B] border border-[#2A2D30] rounded-3xl p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
              <span className="text-sm font-extrabold text-[#ECEBE9]">Add Automation Node</span>
              <button onClick={() => setShowAddNodeModal(false)} className="text-[#72706C] hover:text-[#ECEBE9]">
                <X size={16} />
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72706C]" />
              <input
                type="text"
                value={nodeSearchQuery}
                onChange={e => setNodeSearchQuery(e.target.value)}
                placeholder="Search document upload, LLM, agent, vector store..."
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl pl-9 pr-3 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {[
                { type: 'document_upload', label: 'Document Upload', icon: 'FileText', color: '#A855F7' },
                { type: 'trigger', label: 'Chat Trigger', icon: 'Zap', color: '#E05D52' },
                { type: 'agent', label: 'AI Tools Agent', icon: 'Bot', color: '#3C6B4D' },
                { type: 'llm', label: 'Local Ollama LLM', icon: 'Cpu', color: '#10A37F' },
                { type: 'vector_store', label: 'Vector Store', icon: 'Layers', color: '#DC2626' },
                { type: 'tool', label: 'Web Search Tool', icon: 'Search', color: '#2563EB' },
                { type: 'mcp_tool', label: 'MCP Tool', icon: 'Shield', color: '#3C6B4D' },
                { type: 'formatter', label: 'JSON Formatter', icon: 'Code', color: '#8B5CF6' },
                { type: 'export', label: 'File Exporter', icon: 'Download', color: '#D97706' }
              ]
                .filter(n => !nodeSearchQuery || n.label.toLowerCase().includes(nodeSearchQuery.toLowerCase()))
                .map(item => (
                  <button
                    key={item.type}
                    onClick={() => handleAddNode(item.type as any)}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] hover:bg-[#18191B] text-left transition-all group"
                  >
                    <div className="p-2 rounded-xl bg-[#18191B] border border-[#2A2D30]">
                      {renderIcon(item.icon, item.color, 14)}
                    </div>
                    <span className="text-xs font-bold text-[#ECEBE9] truncate">{item.label}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RICH CUSTOMIZABLE NODE CONFIG DRAWER ── */}
      {selectedNode && (
        <div className="absolute right-3 top-3 z-30 w-80 bg-[#18191B] border border-[#3C6B4D]/60 rounded-2xl shadow-2xl p-4 space-y-3 font-sans max-h-[calc(100%-24px)] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-black text-[#3C6B4D] flex items-center gap-1.5">
              <Settings size={14} /> Edit Node Settings
            </span>
            <button onClick={() => setSelectedNodeId(null)} className="text-[#72706C] hover:text-[#ECEBE9]">
              <X size={14} />
            </button>
          </div>

          {/* ── MCP TOOL CONFIG SECTION ── */}
          {selectedNode.type === 'mcp_tool' && (() => {
            const serverKey = (selectedNode.config.mcpServer || 'filesystem') as McpServerKey;
            const serverDef = MCP_SERVER_CATALOG[serverKey];
            return (
              <div className="p-3 bg-[#111213] border border-[#3C6B4D]/50 rounded-xl space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#3C6B4D] uppercase flex items-center gap-1.5">
                    <Shield size={12} /> MCP Tool Configuration
                  </span>
                  <button
                    onClick={() => { setMcpTutorialServer(serverKey); setShowMcpTutorial(true); }}
                    className="text-[9px] font-bold text-[#3C6B4D] hover:text-emerald-400 flex items-center gap-1 border border-[#3C6B4D]/30 rounded-lg px-2 py-0.5 transition-all"
                  >
                    <Info size={10} /> Tutorial
                  </button>
                </div>

                {/* MCP Server Selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#72706C] uppercase">MCP Server Type</label>
                  <select
                    value={serverKey}
                    onChange={e => {
                      const v = e.target.value as McpServerKey;
                      updateActiveWorkflow(w => ({
                        ...w,
                        nodes: w.nodes.map(n => n.id === selectedNode.id ? {
                          ...n,
                          title: `MCP: ${MCP_SERVER_CATALOG[v].label}`,
                          subtitle: `Tools: ${MCP_SERVER_CATALOG[v].tools.slice(0,2).join(', ')}...`,
                          config: { ...n.config, mcpServer: v, selectedTool: MCP_SERVER_CATALOG[v].tools[0], credentials: {} }
                        } : n)
                      }));
                    }}
                    className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl px-2.5 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                  >
                    {(Object.keys(MCP_SERVER_CATALOG) as McpServerKey[]).map(k => (
                      <option key={k} value={k}>{MCP_SERVER_CATALOG[k].label}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-[#72706C] leading-snug">{serverDef.description}</p>
                </div>

                {/* Tool Selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#72706C] uppercase">Selected Tool</label>
                  <select
                    value={selectedNode.config.selectedTool || serverDef.tools[0]}
                    onChange={e => {
                      const v = e.target.value;
                      updateActiveWorkflow(w => ({
                        ...w,
                        nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, selectedTool: v } } : n)
                      }));
                    }}
                    className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                  >
                    {serverDef.tools.map(t => (
                      <option key={t} value={t}>{t}()</option>
                    ))}
                  </select>
                </div>

                {/* Credential Fields */}
                {serverDef.credentialFields.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#72706C] uppercase flex items-center gap-1">
                      <Lock size={9} /> Credentials (stored locally only)
                    </label>
                    {serverDef.credentialFields.map(field => (
                      <div key={field.key} className="space-y-0.5">
                        <label className="text-[9px] text-[#A3A09B] font-bold">{field.label}</label>
                        <div className="relative">
                          <input
                            type={field.type === 'password' && !showMcpCredPasswords[field.key] ? 'password' : 'text'}
                            placeholder={field.placeholder}
                            value={selectedNode.config.credentials?.[field.key] || ''}
                            onChange={e => {
                              const v = e.target.value;
                              updateActiveWorkflow(w => ({
                                ...w,
                                nodes: w.nodes.map(n => n.id === selectedNode.id ? {
                                  ...n,
                                  config: { ...n.config, credentials: { ...(n.config.credentials || {}), [field.key]: v } }
                                } : n)
                              }));
                            }}
                            className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] pr-7"
                          />
                          {field.type === 'password' && (
                            <button
                              onClick={() => setShowMcpCredPasswords(p => ({ ...p, [field.key]: !p[field.key] }))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#72706C] hover:text-[#ECEBE9]"
                            >
                              {showMcpCredPasswords[field.key] ? <EyeOff size={11} /> : <Eye size={11} />}
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-[#72706C]">{field.hint}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* LLM Compat Warning */}
                {mcpCompatWarning && (
                  <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <AlertTriangle size={11} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-amber-300 leading-snug">{mcpCompatWarning}</p>
                  </div>
                )}

                {/* Available Tools Badge Row */}
                <div>
                  <label className="text-[9px] font-bold text-[#72706C] uppercase block mb-1">Available Tools</label>
                  <div className="flex flex-wrap gap-1">
                    {serverDef.tools.map(t => (
                      <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 rounded-md bg-[#18191B] border border-[#2A2D30] text-[#3C6B4D]">{t}()</span>
                    ))}
                  </div>
                </div>

                {/* Docs Link */}
                <a
                  href={serverDef.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[9px] text-[#3C6B4D] hover:text-emerald-400 font-bold transition-colors"
                >
                  <ExternalLink size={9} /> View {serverDef.label} MCP Docs
                </a>
              </div>
            );
          })()}

          {(selectedNode.type === 'document_upload' || selectedNode.type === 'trigger' || selectedNode.id.includes('doc') || selectedNode.title.toLowerCase().includes('document') || selectedNode.title.toLowerCase().includes('input') || selectedNode.config.fileName) && (
            <div className="p-3 bg-[#111213] border border-[#A855F7]/40 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-[#A855F7] uppercase block">Upload Data File (.pdf, .txt, .json, .csv)</span>
              <label className="flex items-center justify-center gap-2 p-2.5 bg-[#18191B] border border-dashed border-[#A855F7]/60 hover:border-[#A855F7] rounded-xl cursor-pointer text-xs text-[#ECEBE9] font-bold transition-all">
                <Upload size={14} className="text-[#A855F7]" />
                <span>{selectedNode.config.fileName ? `Change File: ${selectedNode.config.fileName}` : '📁 Choose PDF / Data File'}</span>
                <input
                  type="file"
                  accept=".txt,.json,.csv,.md,.pdf,.docx"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(selectedNode.id, e.target.files[0]);
                    }
                  }}
                />
              </label>
              {selectedNode.config.fileContent && (
                <div className="text-[10px] text-[#72706C] space-y-1 font-mono pt-1">
                  <div className="flex justify-between">
                    <span>File Name:</span>
                    <span className="text-[#ECEBE9] font-bold truncate max-w-[140px]">{selectedNode.config.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extracted Size:</span>
                    <span className="text-[#ECEBE9] font-bold">{(selectedNode.config.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Parsed Lines:</span>
                    <span className="text-[#ECEBE9] font-bold">{selectedNode.config.lineCount || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Character Count:</span>
                    <span className="text-[#ECEBE9] font-bold">{selectedNode.config.fileContent.length}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Node Title</label>
            <input
              type="text"
              value={selectedNode.title}
              onChange={e => {
                const val = e.target.value;
                updateActiveWorkflow(w => ({
                  ...w,
                  nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, title: val } : n)
                }));
              }}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>

          {(selectedNode.type === 'llm' || selectedNode.type === 'agent') && (
            <div className="p-3 bg-[#111213] border border-[#10A37F]/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#10A37F] uppercase">
                <span>Select Downloaded Local Model</span>
                <span className="text-[9px] text-[#72706C] font-mono">({localModels.length} models ready)</span>
              </div>
              <select
                value={selectedNode.config.model || localModels[0] || 'gemma2:2b'}
                onChange={e => {
                  const val = e.target.value;
                  updateActiveWorkflow(w => ({
                    ...w,
                    nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, model: val }, subtitle: val } : n)
                  }));
                }}
                className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#10A37F]"
              >
                {localModels.map(m => (
                  <option key={m} value={m}>{m} (Installed Local LLM)</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Subtitle / Model Tag</label>
            <input
              type="text"
              value={selectedNode.subtitle || ''}
              onChange={e => {
                const val = e.target.value;
                updateActiveWorkflow(w => ({
                  ...w,
                  nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, subtitle: val } : n)
                }));
              }}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Configuration / System Prompt</label>
            <textarea
              rows={3}
              value={selectedNode.config.systemPrompt || selectedNode.config.fileContent || selectedNode.config.description || ''}
              onChange={e => {
                const val = e.target.value;
                updateActiveWorkflow(w => ({
                  ...w,
                  nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, systemPrompt: val, description: val, fileContent: val } } : n)
                }));
              }}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-2.5 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] resize-none"
            />
          </div>

          {/* Quick Port Adders */}
          <div className="space-y-2 pt-2 border-t border-[#2A2D30]">
            <span className="text-[10px] font-bold text-[#72706C] uppercase block">Manage Node Handle Ports</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const portId = `in-${Date.now()}`;
                  updateActiveWorkflow(w => ({
                    ...w,
                    nodes: w.nodes.map(n => n.id === selectedNode.id ? {
                      ...n,
                      inputs: [...n.inputs, { id: portId, name: `Custom Input ${n.inputs.length + 1}`, type: 'input' }]
                    } : n)
                  }));
                }}
                className="flex-1 px-2 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] rounded-xl text-[10px] font-bold text-[#ECEBE9] transition-all"
              >
                + Add Input Port
              </button>
              <button
                onClick={() => {
                  const portId = `out-${Date.now()}`;
                  updateActiveWorkflow(w => ({
                    ...w,
                    nodes: w.nodes.map(n => n.id === selectedNode.id ? {
                      ...n,
                      outputs: [...n.outputs, { id: portId, name: `Custom Output ${n.outputs.length + 1}`, type: 'output' }]
                    } : n)
                  }));
                }}
                className="flex-1 px-2 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] rounded-xl text-[10px] font-bold text-[#ECEBE9] transition-all"
              >
                + Add Output Port
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2A2D30]">
            <button
              onClick={() => {
                updateActiveWorkflow(w => ({
                  ...w,
                  nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, status: n.status === 'deactivated' ? 'idle' : 'deactivated' } : n)
                }));
              }}
              className="px-3 py-1.5 rounded-xl border border-[#2A2D30] text-[11px] font-bold text-[#72706C] hover:text-[#ECEBE9]"
            >
              {selectedNode.status === 'deactivated' ? 'Activate Node' : 'Deactivate Node'}
            </button>
            <button
              onClick={() => {
                updateActiveWorkflow(w => ({
                  ...w,
                  nodes: w.nodes.filter(n => n.id !== selectedNode.id),
                  connections: w.connections.filter(c => c.fromNodeId !== selectedNode.id && c.toNodeId !== selectedNode.id)
                }));
                setSelectedNodeId(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-bold"
            >
              Delete Node
            </button>
          </div>
        </div>
      )}

      {/* ── MCP TUTORIAL MODAL ── */}
      {showMcpTutorial && (() => {
        const serverDef = MCP_SERVER_CATALOG[mcpTutorialServer];
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#18191B] border border-[#3C6B4D]/60 rounded-3xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#111213] border-b border-[#2A2D30]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#3C6B4D]/20 border border-[#3C6B4D]/40">
                    <Shield size={15} className="text-[#3C6B4D]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#ECEBE9]">MCP Setup Tutorial</p>
                    <p className="text-[10px] text-[#72706C]">Model Context Protocol → {serverDef.label}</p>
                  </div>
                </div>
                <button onClick={() => setShowMcpTutorial(false)} className="text-[#72706C] hover:text-[#ECEBE9]">
                  <X size={15} />
                </button>
              </div>

              {/* Server Tabs */}
              <div className="flex overflow-x-auto px-4 pt-3 gap-1.5 border-b border-[#2A2D30] pb-0">
                {(Object.keys(MCP_SERVER_CATALOG) as McpServerKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setMcpTutorialServer(k)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-t-xl border-b-2 transition-all shrink-0 ${
                      mcpTutorialServer === k
                        ? 'border-[#3C6B4D] text-[#ECEBE9] bg-[#111213]'
                        : 'border-transparent text-[#72706C] hover:text-[#ECEBE9]'
                    }`}
                  >
                    {MCP_SERVER_CATALOG[k].label}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
                {/* Description */}
                <div className="p-3 bg-[#111213] border border-[#3C6B4D]/30 rounded-xl">
                  <p className="text-xs text-[#A3A09B] leading-relaxed">{serverDef.description}</p>
                </div>

                {/* Step-by-Step Guide */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-[#ECEBE9] uppercase tracking-wide">Setup Steps</p>
                  {serverDef.setupSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 bg-[#111213] border border-[#2A2D30] rounded-xl group hover:border-[#3C6B4D]/50 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-[#3C6B4D]/20 border border-[#3C6B4D]/50 text-[#3C6B4D] text-[9px] font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-[10px] text-[#A3A09B] leading-snug font-mono flex-1">{step}</p>
                      <ChevronRight size={12} className="text-[#72706C] shrink-0 group-hover:text-[#3C6B4D] transition-colors" />
                    </div>
                  ))}
                </div>

                {/* Credential Fields Preview */}
                {serverDef.credentialFields.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-[#ECEBE9] uppercase tracking-wide">Required Credentials</p>
                    {serverDef.credentialFields.map(f => (
                      <div key={f.key} className="p-2.5 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-0.5">
                        <p className="text-[10px] font-bold text-[#3C6B4D]">{f.label}</p>
                        <code className="text-[9px] font-mono text-[#72706C]">{f.placeholder}</code>
                        <p className="text-[9px] text-[#A3A09B]">{f.hint}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available Tools */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-[#ECEBE9] uppercase tracking-wide">Available MCP Tools</p>
                  <div className="flex flex-wrap gap-1.5">
                    {serverDef.tools.map(t => (
                      <span key={t} className="text-[9px] font-mono px-2 py-1 rounded-lg bg-[#111213] border border-[#3C6B4D]/40 text-[#3C6B4D]">{t}()</span>
                    ))}
                  </div>
                </div>

                {/* Compatible Models */}
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={11} className="text-amber-400" />
                    <p className="text-[10px] font-black text-amber-300 uppercase">LLM Compatibility Requirement</p>
                  </div>
                  <p className="text-[9px] text-amber-200/80 leading-snug">
                    MCP tool calling requires a model that supports JSON-schema function calling. Small models (llama3.2:1b, phi3:mini) may not work reliably.
                  </p>
                  <p className="text-[9px] font-black text-amber-300">Recommended compatible models:</p>
                  <div className="flex flex-wrap gap-1">
                    {['mistral:7b', 'llama3.2:3b', 'qwen2.5-coder:7b', 'gemma2:9b', 'qwen2.5:14b'].map(m => (
                      <span key={m} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Simulation Notice */}
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Info size={11} className="text-blue-400" />
                    <p className="text-[10px] font-black text-blue-300">Simulation Mode</p>
                  </div>
                  <p className="text-[9px] text-blue-200/70 leading-snug">
                    In the browser demo, MCP tool calls return <strong>simulated JSON-RPC 2.0 responses</strong> matching the real MCP protocol schema.
                    For live execution, run your local MCP server (shown in setup steps above) and connect to DomoDomo running locally.
                  </p>
                </div>

                {/* Docs Link */}
                <a
                  href={serverDef.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#3C6B4D]/20 hover:bg-[#3C6B4D]/30 border border-[#3C6B4D]/50 rounded-xl text-xs font-bold text-[#3C6B4D] transition-all"
                >
                  <ExternalLink size={13} />
                  Open {serverDef.label} Official Docs
                </a>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
