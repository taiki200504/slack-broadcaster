import type { Workspace } from "../types";

interface Props {
  workspaces: Workspace[];
  onToggle: (id: string) => void;
}

export function WorkspaceList({ workspaces, onToggle }: Props) {
  if (workspaces.length === 0) {
    return (
      <div className="text-sm text-gray-400 dark:text-gray-500 py-2">
        ワークスペースが未登録です。右上の設定から追加してください。
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {workspaces.map((ws) => (
        <label
          key={ws.id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer select-none text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <input
            type="checkbox"
            checked={ws.enabled}
            onChange={() => onToggle(ws.id)}
            className="accent-indigo-500"
          />
          <span className="text-gray-800 dark:text-gray-200">{ws.name}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            #{ws.channelName}
          </span>
        </label>
      ))}
    </div>
  );
}
