import { useState, useEffect, useCallback } from "react";
import type { Workspace, AppData } from "../types";
import { loadData, saveData } from "../lib/storage";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then((data) => {
      setAppData(data);
      setWorkspaces(data.workspaces);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(
    async (newWorkspaces: Workspace[]) => {
      if (!appData) return;
      const newData = { ...appData, workspaces: newWorkspaces };
      setAppData(newData);
      setWorkspaces(newWorkspaces);
      await saveData(newData);
    },
    [appData]
  );

  const addWorkspace = useCallback(
    async (ws: Omit<Workspace, "id" | "enabled">) => {
      const newWs: Workspace = {
        ...ws,
        id: crypto.randomUUID(),
        enabled: true,
      };
      await persist([...workspaces, newWs]);
    },
    [workspaces, persist]
  );

  const removeWorkspace = useCallback(
    async (id: string) => {
      await persist(workspaces.filter((ws) => ws.id !== id));
    },
    [workspaces, persist]
  );

  const toggleWorkspace = useCallback(
    async (id: string) => {
      await persist(
        workspaces.map((ws) =>
          ws.id === id ? { ...ws, enabled: !ws.enabled } : ws
        )
      );
    },
    [workspaces, persist]
  );

  return {
    workspaces,
    loading,
    addWorkspace,
    removeWorkspace,
    toggleWorkspace,
    appData,
    setAppData,
  };
}
