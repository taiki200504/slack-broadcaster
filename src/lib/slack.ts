import { invoke } from "@tauri-apps/api/core";
import type { SendResult, Workspace } from "../types";

export async function broadcastMessage(
  workspaces: Workspace[],
  text: string
): Promise<SendResult[]> {
  const targets = workspaces
    .filter((ws) => ws.enabled)
    .map((ws) => ({
      token: ws.token,
      channelId: ws.channelId,
      workspaceId: ws.id,
      workspaceName: ws.name,
    }));

  return invoke<SendResult[]>("broadcast_message", { targets, text });
}

export async function testToken(
  token: string
): Promise<{ ok: boolean; user?: string; team?: string; error?: string }> {
  return invoke("test_token", { token });
}
