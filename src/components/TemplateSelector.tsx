import type { Template } from "../types";

interface Props {
  templates: Template[];
  onSelect: (content: string) => void;
}

export function TemplateSelector({ templates, onSelect }: Props) {
  if (templates.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.content)}
          className="px-3 py-1.5 text-sm rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
