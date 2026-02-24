export interface Workspace {
  id: string;
  name: string;
  token: string; // xoxp- から始まるUser Token
  channelId: string;
  channelName: string;
  enabled: boolean;
}

export interface Template {
  id: string;
  label: string;
  content: string;
}

export interface SendResult {
  workspaceId: string;
  workspaceName: string;
  success: boolean;
  error?: string;
}

export interface AppData {
  workspaces: Workspace[];
  templates: Template[];
}
