import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { useState } from "react";
import UserCard from "@/components/Cards/UserCard";
import { useTrendingDevelopers } from "@/utils/fetcher";
import { User } from "@/types/users";

type TimePeriod = "daily" | "weekly" | "monthly";

export default function TrendingDevelopers() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
    const [page] = useState<number>(1); // Add page state if needed

    // Use our existing SWR hook with time range parameter
    const {
        data: trendingDevs,
        error,
        isLoading
    } = useTrendingDevelopers(timePeriod, page);

    // Process the data - limit to 6 developers
    const displayDevs = Array.isArray(trendingDevs?.data)
        ? trendingDevs.data.slice(0, 6)
        : [];

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
            },
        },
        hover: {
            scale: 1.03,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
            },
        },
    };

    // Handle time period change
    const handleTimePeriodChange = (period: TimePeriod) => {
        setTimePeriod(period);
    };

    return (
        <section className="w-full mb-12 md:mb-16">
            <motion.div
                className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
            >
                <h2 className="text-xl md:text-2xl font-semibold mb-4 sm:mb-0">Trending Developers</h2>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                    <div className="flex space-x-2 mr-4">
                        <button
                            onClick={() => handleTimePeriodChange("daily")}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === "daily"
                                ? "bg-github-accent text-white"
                                : "bg-github-bg-secondary hover:bg-github-bg-tertiary text-github-text-primary"
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => handleTimePeriodChange("weekly")}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === "weekly"
                                ? "bg-github-accent text-white"
                                : "bg-github-bg-secondary hover:bg-github-bg-tertiary text-github-text-primary"
                                }`}
                        >
                            This week
                        </button>
                        <button
                            onClick={() => handleTimePeriodChange("monthly")}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === "monthly"
                                ? "bg-github-accent text-white"
                                : "bg-github-bg-secondary hover:bg-github-bg-tertiary text-github-text-primary"
                                }`}
                        >
                            This month
                        </button>
                    </div>

                    <Link href={`/trending/developers?since=${timePeriod}`} className="flex items-center text-github-accent hover:text-github-accent-hover text-sm md:text-base font-medium">
                        <motion.span
                            initial={{ x: 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            View more
                        </motion.span>
                        <motion.div
                            initial={{ x: 0 }}
                            whileHover={{ x: 8 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <FaArrowRight className="ml-2 h-4 w-4" />
                        </motion.div>
                    </Link>
                </div>
            </motion.div>

            {isLoading ? (
                <motion.div
                    className="flex justify-center items-center min-h-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="w-12 h-12 border-4 border-github-accent/30 border-t-github-accent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                </motion.div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-github-text-secondary">Failed to load trending developers</p>
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {displayDevs.length > 0 ? (
                        displayDevs.map((dev: User, index: number) => (
                            <motion.div
                                key={dev.id || `dev-${index}`}
                                variants={itemVariants}
                                custom={index}
                                whileHover="hover"
                            >
                                <UserCard user={dev} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-github-text-secondary">No trending developers found</p>
                        </div>
                    )}
                </motion.div>
            )}
        </section>
    );
}