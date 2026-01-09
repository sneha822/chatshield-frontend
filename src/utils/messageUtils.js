/**
 * Toxicity level definitions
 * Using theme-consistent colors for a cohesive design
 */
export const TOXICITY_LEVELS = {
    SAFE: {
        label: 'Safe',
        threshold: 0.35
    },
    MILD: {
        label: 'Mild',
        threshold: 0.75
    },
    SEVERE: {
        label: 'Severe',
        threshold: 1.0
    }
};

/**
 * Determine toxicity level based on score
 * @param {Object} toxicity - Toxicity object with 'toxicity' property (0-1)
 * @returns {Object} The toxicity level object
 */
export const getToxicityLevel = (toxicity) => {
    if (!toxicity || typeof toxicity.toxicity !== 'number') {
        return TOXICITY_LEVELS.SAFE;
    }

    const score = toxicity.toxicity;

    if (score < TOXICITY_LEVELS.SAFE.threshold) {
        return TOXICITY_LEVELS.SAFE;
    }
    if (score < TOXICITY_LEVELS.MILD.threshold) {
        return TOXICITY_LEVELS.MILD;
    }
    return TOXICITY_LEVELS.SEVERE;
};

/**
 * Format timestamp to readable time
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string (HH:MM)
 */
export const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
};
