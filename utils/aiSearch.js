/**
 * Simple "AI" simulator that maps vibe keywords to database search terms.
 * This avoids the need for an actual API key during interviews while demonstrating the concept.
 */

const vibeMap = {
    // Nature & Outdoors
    "nature": ["forest", "mountain", "lake", "river", "garden", "green", "hill"],
    "mountain": ["mountain", "hill", "peak", "hike", "ski", "chalet"],
    "beach": ["beach", "sea", "ocean", "coast", "sand", "wave", "surf"],
    "water": ["lake", "river", "pool", "ocean", "pond"],

    // Atmosphere
    "romantic": ["cosy", "private", "view", "sunset", "couple", "candle", "luxury"],
    "quiet": ["peaceful", "calm", "secluded", "private", "silent", "retreat"],
    "party": ["downtown", "city", "nightlife", "loud", "music", "group"],
    "family": ["spacious", "garden", "kid", "child", "play", "safe"],

    // Activity
    "work": ["wifi", "desk", "office", "workspace", "internet"],
    "food": ["kitchen", "restaurant", "cafe", "dining", "cook", "chef"],
    "pet": ["pet", "dog", "cat", "animal", "fenced"],

    // Weather/Season
    "winter": ["snow", "fireplace", "warm", "ski", "cozy"],
    "summer": ["pool", "ac", "cool", "breeze", "sun"],
};

function extractKeywords(query) {
    if (!query) return null;

    const lowerQuery = query.toLowerCase();
    let searchTerms = [];

    // 1. Direct matches from our "Knowledge Graph" (vibeMap)
    for (const [vibe, keywords] of Object.entries(vibeMap)) {
        if (lowerQuery.includes(vibe)) {
            searchTerms = [...searchTerms, ...keywords];
        }
    }

    // 2. If no vibe matches, treat the words themselves as keywords
    // Remove stop words for better results
    const stopWords = ["a", "an", "the", "in", "on", "at", "for", "with", "i", "want", "place", "looking", "stay"];
    const queryWords = lowerQuery.split(" ").filter(word => !stopWords.includes(word));

    if (searchTerms.length === 0) {
        searchTerms = queryWords;
    } else {
        // Mix in explicit words even if we found a vibe
        // e.g., "mountain house" -> includes "house" + mountain keywords
        searchTerms = [...searchTerms, ...queryWords];
    }

    // Remove duplicates
    searchTerms = [...new Set(searchTerms)];

    // 3. Construct MongoDB Query
    // Searches title, description, OR location for ANY of the terms
    return {
        $or: searchTerms.map(term => ({
            $or: [
                { title: { $regex: term, $options: "i" } },
                { description: { $regex: term, $options: "i" } },
                { location: { $regex: term, $options: "i" } },
                { category: { $regex: term, $options: "i" } }
            ]
        }))
    };
}

module.exports = { extractKeywords };
