import { FaColumns, FaRegWindowMaximize } from "react-icons/fa";

interface ViewToggleProps {
    viewMode: "standard" | "explorer";
    toggleViewMode: () => void;
}

export default function ViewToggle({ viewMode, toggleViewMode }: ViewToggleProps) {
    return (
        <div className="flex items-center space-x-2">
            <FaRegWindowMaximize
                className={`h-4 w-4 ${viewMode === "standard" ? "text-github-link" : "text-github-text-secondary"}`}
            />
            <button
                onClick={toggleViewMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${viewMode === "explorer" ? "bg-github-link" : "bg-github-dark-secondary"}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${viewMode === "explorer" ? "translate-x-6" : "translate-x-1"}`}
                />
            </button>
            <FaColumns
                className={`h-4 w-4 ${viewMode === "explorer" ? "text-github-link" : "text-github-text-secondary"}`}
            />
            <span className="text-xs text-github-text-secondary">
                {viewMode === "standard" ? "Standard View" : "Modern View"}
            </span>
        </div>
    );
}