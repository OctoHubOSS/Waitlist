/**
 * Common animation variants used across the application
 */
export const animations = {
    // Container animation for staggered children
    containerVariants: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    },

    // Individual item animation
    itemVariants: {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    },

    // Fade in animation
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    },

    // Scale animation
    scale: {
        hidden: { scale: 0.9, opacity: 0 },
        visible: { scale: 1, opacity: 1 }
    }
};