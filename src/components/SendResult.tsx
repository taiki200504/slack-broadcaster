import type { SendResult as SendResultType } from "../types";

interface Props {
  results: SendResultType[];
}

export function SendResultList({ results }: Props) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-1 mt-3">
      {results.map((r) => (
        <div
          key={r.workspaceId}
          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
            r.success
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
          }`}
        >
          <span>{r.success ? "✅" : "❌"}</span>
          <span className="font-medium">{r.workspaceName}</span>
          {r.error && <span className="text-xs opacity-75">— {r.error}</span>}
        </div>
      ))}
    </div>
  );
}
