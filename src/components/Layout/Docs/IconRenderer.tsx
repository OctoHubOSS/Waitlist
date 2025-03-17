import React from "react";
import * as LucideIcons from "lucide-react";
import * as ReactIcons from "react-icons/fa";

// Icon component that can render icons from either Lucide or React Icons
export function IconRenderer({ iconName, size = 18 }: { iconName?: string; size?: number }) {
    if (!iconName) return null;

    // Try to use Lucide icons first
    const LucideIcon = (LucideIcons as any)[iconName];
    if (LucideIcon) {
        return <LucideIcon size={size} className="mr-2" />;
    }

    // Fall back to React Icons
    const iconPrefix = iconName.substring(0, 2);
    const iconSet = (ReactIcons as any)[iconPrefix];
    if (iconSet) {
        const ReactIcon = iconSet[iconName];
        if (ReactIcon) {
            return <ReactIcon size={size} className="mr-2" />;
        }
    }

    // Default fallback
    return null;
}
