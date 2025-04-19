export const staggerChildren = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.1 }
    }
};

export const profileHeaderVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            damping: 15,
            stiffness: 100
        }
    }
};

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            damping: 12,
            stiffness: 100
        }
    }
};

export const imageContainerVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
        scale: 1, 
        opacity: 1,
        transition: {
            type: "spring",
            damping: 15,
            stiffness: 100
        }
    },
    hover: {
        scale: 1.05,
        transition: {
            type: "spring",
            damping: 10,
            stiffness: 100
        }
    }
};

export const formFieldVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { 
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 15,
            stiffness: 100
        }
    },
    exit: {
        opacity: 0,
        x: 10,
        transition: {
            type: "spring",
            damping: 15,
            stiffness: 100
        }
    }
};

export const inputVariants = {
    focus: {
        scale: 1.02,
        transition: {
            type: "spring",
            damping: 15,
            stiffness: 400
        }
    },
    error: {
        x: [0, -5, 5, -5, 5, 0],
        transition: {
            duration: 0.4
        }
    }
};

export const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
        scale: 1.05,
        transition: {
            type: "spring",
            damping: 10,
            stiffness: 400
        }
    },
    tap: { 
        scale: 0.95,
        transition: {
            type: "spring",
            damping: 15,
            stiffness: 400
        }
    }
};

export const jobListingVariants = {
    initial: { opacity: 0 },
    animate: { 
        opacity: 1,
        transition: {
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    }
};
