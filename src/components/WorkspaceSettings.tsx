import { useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { Workspace, Template } from "../types";
import { testToken } from "../lib/slack";

interface Props {
  workspaces: Workspace[];
  templates: Template[];
  onAddWorkspace: (ws: Omit<Workspace, "id" | "enabled">) => Promise<void>;
  onRemoveWorkspace: (id: string) => Promise<void>;
  onToggleWorkspace: (id: string) => Promise<void>;
  onAddTemplate: (label: string, content: string) => Promise<void>;
  onRemoveTemplate: (id: string) => Promise<void>;
  onClose: () => void;
}

export function WorkspaceSettings({
  workspaces,
  templates,
  onAddWorkspace,
  onRemoveWorkspace,
  onToggleWorkspace,
  onAddTemplate,
  onRemoveTemplate,
  onClose,
}: Props) {
  const [tab, setTab] = useState<"workspaces" | "templates">("workspaces");
  const [showTokenGuide, setShowTokenGuide] = useState(false);

  // Workspace form
  const [wsName, setWsName] = useState("");
  const [wsToken, setWsToken] = useState("");
  const [wsChannelId, setWsChannelId] = useState("");
  const [wsChannelName, setWsChannelName] = useState("");
  const [tokenStatus, setTokenStatus] = useState<string>("");
  const [testing, setTesting] = useState(false);

  // Template form
  const [tplLabel, setTplLabel] = useState("");
  const [tplContent, setTplContent] = useState("");

  const handleTestToken = async () => {
    if (!wsToken.trim()) return;
    setTesting(true);
    setTokenStatus("");
    const result = await testToken(wsToken.trim());
    if (result.ok) {
      setTokenStatus(`✅ ${result.team} / ${result.user}`);
    } else {
      setTokenStatus(`❌ ${result.error}`);
    }
    setTesting(false);
  };

  const handleAddWorkspace = async () => {
    if (!wsName.trim() || !wsToken.trim() || !wsChannelId.trim()) return;
    await onAddWorkspace({
      name: wsName.trim(),
      token: wsToken.trim(),
      channelId: wsChannelId.trim(),
      channelName: wsChannelName.trim() || wsChannelId.trim(),
    });
    setWsName("");
    setWsToken("");
    setWsChannelId("");
    setWsChannelName("");
    setTokenStatus("");
  };

  const handleRemoveWorkspace = async (id: string, name: string) => {
    if (confirm(`「${name}」を削除しますか？`)) {
      await onRemoveWorkspace(id);
    }
  };

  const handleAddTemplate = async () => {
    if (!tplLabel.trim() || !tplContent.trim()) return;
    await onAddTemplate(tplLabel.trim(), tplContent.trim());
    setTplLabel("");
    setTplContent("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("workspaces")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                tab === "workspaces"
                  ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              ワークスペース
            </button>
            <button
              onClick={() => setTab("templates")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                tab === "templates"
                  ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              テンプレート
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === "workspaces" && (
            <>
              {/* Workspace list */}
              {workspaces.length > 0 && (
                <div className="space-y-2">
                  {workspaces.map((ws) => (
                    <div
                      key={ws.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={ws.enabled}
                          onChange={() => onToggleWorkspace(ws.id)}
                          className="accent-indigo-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {ws.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            #{ws.channelName}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveWorkspace(ws.id, ws.name)}
                        className="text-red-400 hover:text-red-600 text-sm transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add workspace form */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ワークスペースを追加
                </h3>
                <input
                  type="text"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  placeholder="ワークスペース名"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wsToken}
                    onChange={(e) => setWsToken(e.target.value)}
                    placeholder="xoxp-... (User Token)"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleTestToken}
                    disabled={testing || !wsToken.trim()}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {testing ? "検証中..." : "Token検証"}
                  </button>
                </div>
                {tokenStatus && (
                  <div className="text-xs px-2">{tokenStatus}</div>
                )}
                <button
                  type="button"
                  onClick={() => setShowTokenGuide(!showTokenGuide)}
                  className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${showTokenGuide ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  User Tokenの取得方法
                </button>
                {showTokenGuide && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2 leading-relaxed">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Slack User Token (xoxp-) の発行手順:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li><a href="#" onClick={(e) => { e.preventDefault(); openUrl("https://api.slack.com/apps"); }} className="text-indigo-500 hover:underline cursor-pointer">api.slack.com/apps</a> にアクセス</li>
                      <li>「Create New App」→「From scratch」を選択</li>
                      <li>App名とワークスペースを指定して作成</li>
                      <li>左メニュー「OAuth &amp; Permissions」を開く</li>
                      <li>「User Token Scopes」に以下を追加:
                        <span className="inline-block mt-1 font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">chat:write</span>
                      </li>
                      <li>ページ上部の「Install to Workspace」をクリック</li>
                      <li>許可後に表示される <span className="font-mono">xoxp-</span> で始まるトークンをコピー</li>
                    </ol>
                    <p className="text-gray-400 dark:text-gray-500 pt-1">※ ワークスペースごとに別のAppを作成してください</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wsChannelId}
                    onChange={(e) => setWsChannelId(e.target.value)}
                    placeholder="チャンネルID (C...)"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={wsChannelName}
                    onChange={(e) => setWsChannelName(e.target.value)}
                    placeholder="チャンネル名"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleAddWorkspace}
                  disabled={
                    !wsName.trim() || !wsToken.trim() || !wsChannelId.trim()
                  }
                  className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  追加
                </button>
              </div>
            </>
          )}

          {tab === "templates" && (
            <>
              {/* Template list */}
              {templates.length > 0 && (
                <div className="space-y-2">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {t.label}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          {t.content}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveTemplate(t.id)}
                        className="text-red-400 hover:text-red-600 text-sm transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add template form */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  テンプレートを追加
                </h3>
                <input
                  type="text"
                  value={tplLabel}
                  onChange={(e) => setTplLabel(e.target.value)}
                  placeholder="ラベル（例: おはよう）"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  value={tplContent}
                  onChange={(e) => setTplContent(e.target.value)}
                  placeholder="テンプレート内容"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddTemplate}
                  disabled={!tplLabel.trim() || !tplContent.trim()}
                  className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  追加
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
