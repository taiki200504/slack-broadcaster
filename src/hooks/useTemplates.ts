import { useState, useEffect, useCallback } from "react";
import type { Template, AppData } from "../types";
import { loadData, saveData } from "../lib/storage";

export function useTemplates(
  appData: AppData | null,
  setAppData: (data: AppData) => void
) {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (appData) {
      setTemplates(appData.templates);
    } else {
      loadData().then((data) => setTemplates(data.templates));
    }
  }, [appData]);

  const persist = useCallback(
    async (newTemplates: Template[]) => {
      if (!appData) return;
      const newData = { ...appData, templates: newTemplates };
      setAppData(newData);
      setTemplates(newTemplates);
      await saveData(newData);
    },
    [appData, setAppData]
  );

  const addTemplate = useCallback(
    async (label: string, content: string) => {
      const newTemplate: Template = {
        id: crypto.randomUUID(),
        label,
        content,
      };
      await persist([...templates, newTemplate]);
    },
    [templates, persist]
  );

  const removeTemplate = useCallback(
    async (id: string) => {
      await persist(templates.filter((t) => t.id !== id));
    },
    [templates, persist]
  );

  return { templates, addTemplate, removeTemplate };
}
