import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown } from "lucide-react";
import { DocCategory } from "@/utils/documentation/markdown";
import { IconRenderer } from "./IconRenderer";

interface CategoryDropdownProps {
    rootCategories: DocCategory[];
    currentRootCategory: DocCategory | undefined;
    onSelectCategory: (categoryTitle: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isMobile?: boolean;
}

export function CategoryDropdown({
    rootCategories,
    currentRootCategory,
    onSelectCategory,
    isOpen,
    setIsOpen,
    isMobile = false
}: CategoryDropdownProps) {
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsOpen]);

    const handleCategorySelect = (category: DocCategory) => {
        setIsOpen(false);
        onSelectCategory(category.title);

        if (category.pages[0]) {
            router.push(`/docs/${category.pages[0].slug}`);
        }
    };

    const buttonStyles = isMobile
        ? "flex items-center gap-2 text-white font-medium"
        : "flex items-center justify-between w-full px-3 py-2 bg-github-dark-secondary rounded-md text-white font-medium";

    const dropdownStyles = isMobile
        ? "absolute left-0 right-0 mt-2 py-2 bg-github-dark-secondary rounded-md shadow-lg border border-gray-800 z-20"
        : "absolute left-0 right-0 mt-1 py-1 bg-github-dark-secondary rounded-md shadow-lg border border-gray-800 z-20";

    return (
        <div className={`relative ${isMobile ? "" : "w-full"}`} ref={dropdownRef}>
            <button
                className={buttonStyles}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex items-center gap-2 truncate">
                    {currentRootCategory?.icon ? (
                        <IconRenderer iconName={currentRootCategory.icon} />
                    ) : (
                        <BookOpen size={isMobile ? 18 : 20} className="mr-1" />
                    )}
                    {currentRootCategory?.title || "Documentation"}
                </span>
                <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && rootCategories.length > 0 && (
                <div className={dropdownStyles}>
                    {rootCategories.map((category) => (
                        <button
                            key={category.title}
                            className={`w-full text-left px-4 py-2 flex items-center gap-2 ${currentRootCategory?.title === category.title
                                    ? "text-github-accent bg-github-accent/10"
                                    : "text-gray-300 hover:bg-gray-800"
                                }`}
                            onClick={() => handleCategorySelect(category)}
                        >
                            {category.icon ? (
                                <IconRenderer iconName={category.icon} />
                            ) : (
                                <div className="w-[18px] h-[18px]"></div>
                            )}
                            <span>{category.title}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
