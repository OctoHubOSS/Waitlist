import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

interface SidebarDropdownProps {
    label: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export function SidebarDropdown({
    label,
    children,
    defaultOpen = false,
    icon,
    className = ""
}: SidebarDropdownProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className={`w-full ${className}`}>
            <button
                onClick={toggleDropdown}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
            >
                <span className="flex items-center">
                    {icon && <span className="mr-2">{icon}</span>}
                    {label}
                </span>
                <FiChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
                />
            </button>
            {isOpen && (
                <div className="mt-1 rounded-md py-1">
                    {children}
                </div>
            )}
        </div>
    );
}
