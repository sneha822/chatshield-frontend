export const TOXICITY_LEVELS = {
    SAFE: { label: 'Safe', color: 'bg-green-100 text-green-700', border: 'border-green-200' },
    MILD: { label: 'Mild', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
    SEVERE: { label: 'Severe', color: 'bg-red-100 text-red-700', border: 'border-red-200' }
};

export const getToxicityLevel = (toxicity) => {
    if (!toxicity || typeof toxicity.toxicity !== 'number') return TOXICITY_LEVELS.SAFE;

    const score = toxicity.toxicity;
    if (score < 0.35) return TOXICITY_LEVELS.SAFE;
    if (score < 0.75) return TOXICITY_LEVELS.MILD;
    return TOXICITY_LEVELS.SEVERE;
};

export const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
