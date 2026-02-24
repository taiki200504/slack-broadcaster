import { useState, useEffect } from "react";
import { useWorkspaces } from "./hooks/useWorkspaces";
import { useTemplates } from "./hooks/useTemplates";
import { WorkspaceList } from "./components/WorkspaceList";
import { MessageForm } from "./components/MessageForm";
import { TemplateSelector } from "./components/TemplateSelector";
import { WorkspaceSettings } from "./components/WorkspaceSettings";

function App() {
  const {
    workspaces,
    loading,
    addWorkspace,
    removeWorkspace,
    toggleWorkspace,
    appData,
    setAppData,
  } = useWorkspaces();
  const { templates, addTemplate, removeTemplate } = useTemplates(
    appData,
    setAppData
  );
  const [message, setMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Slack Broadcaster
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="テーマ切替"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="設定"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Workspace selection */}
        <WorkspaceList workspaces={workspaces} onToggle={toggleWorkspace} />

        {/* Message input */}
        <MessageForm
          workspaces={workspaces}
          message={message}
          setMessage={setMessage}
        />

        {/* Templates */}
        <TemplateSelector
          templates={templates}
          onSelect={(content) => setMessage(content)}
        />
      </div>

      {/* Settings modal */}
      {showSettings && (
        <WorkspaceSettings
          workspaces={workspaces}
          templates={templates}
          onAddWorkspace={addWorkspace}
          onRemoveWorkspace={removeWorkspace}
          onToggleWorkspace={toggleWorkspace}
          onAddTemplate={addTemplate}
          onRemoveTemplate={removeTemplate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
