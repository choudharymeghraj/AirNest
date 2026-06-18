const Listing = require('../models/listing'); 
const { fetchAIAnalysisWithFallback } = require('../utils/aiFallbackEngine');

module.exports.getRecommendations = async (req, res) => {
    try {
        const { userQuery } = req.body;
        
        if (!userQuery) {
            return res.status(400).json({ error: "Query string is required." });
        }

        // Fetch properties (limit to 30 as specified by the user)
        const availableListings = await Listing.find({}).limit(30);

        const compactInventory = availableListings.map(listing => 
            `Title: ${listing.title} | Location: ${listing.location} | Max Guests: ${listing.maxGuests} | Price: ₹${listing.price}/night | Rating: ${listing.rating} | Amenities: ${listing.amenities.join(', ')}`
        ).join('\n');

        const compiledPrompt = `
        You are the advanced "AirNest AI Core Optimizer," utilizing next-generation predictive modeling to serve as a high-fidelity hospitality engine. Your objective is to extract intent from a user query, map it to the active property inventory provided, and generate a hyper-targeted recommendation array.

        ### DATA PARSING REQUIREMENTS (GEMINI 2.5/3 CORE):
        1. USER_QUERY: "${userQuery}"
        2. CURRENT_INVENTORY:
        ${compactInventory}

        ### COGNITIVE FILTERING PROTOCOL:
        - CAPACITY BOUNDS: Instantly eliminate any property where Max Guests < requested traveler count.
        - BUDGET CEILING: Prioritize options matching or falling below the requested budget. If an entry slightly exceeds it but matches the target vibe perfectly, label it as an "Alternative Upsell."
        - VIBE MAPPER: Dynamically match subjective terms ("romantic getaway", "workation", "scenic view") directly against the property's Title and Amenities strings.

        ### STRICT MARKDOWN OUTPUT SYSTEM:
        You must structure your response precisely according to this layout. Avoid any conversational pleasantries outside the defined structural zones.

        #### 🏢 Match Level: Optimal Stays

        ##### 🏡 [Insert Property Name 1]
        * **Financial Metric:** ₹[Price]/night | **Rating:** ⭐ [Rating]
        * **Target Vectors:** [List 3 highly relevant matching amenities]
        * **Algorithmic Justification:** [1-2 sentences mapping the specific historical reason why this listing fits the core user intent].

        ##### 🏡 [Insert Property Name 2]
        * **Financial Metric:** ₹[Price]/night | **Rating:** ⭐ [Rating]
        * **Target Vectors:** [List 3 highly relevant matching amenities]
        * **Algorithmic Justification:** [1-2 sentences mapping the specific historical reason why this listing fits the core user intent].

        ---

        #### 💬 Conversational Vector Refinement
        [If any crucial data point like location, budget, or guest count is completely missing from USER_QUERY, ask an explicit, brief question to capture the missing parameter. If all parameters are satisfied, ask a subtle preference query to narrow down the vibe, e.g., "Would you prefer a property closer to nightlife or a secluded retreat?"]
        `;

        // Call the fallback engine
        const aiResponse = await fetchAIAnalysisWithFallback(compiledPrompt, process.env.GEMINI_API_KEY);
        
        // ALWAYS return a structured JSON response
        return res.status(200).json({ success: true, response: aiResponse.text });

    } catch (error) {
        console.error("AI Controller Error:", error.message);
        // Prevent frontend network crash by returning status 500 with clear JSON
        return res.status(500).json({ success: false, error: error.message || "Internal Service Failure" });
    }
};
