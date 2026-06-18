const axios = require('axios');

const GEMINI_MODELS_FALLBACK = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro-latest",
  "gemini-flash-latest"
];

const fetchAIAnalysisWithFallback = async (compiledPrompt, apiKey) => {
  let lastError = null;

  // Use local fallback if apiKey is missing or placeholder
  if (!apiKey || apiKey === "your_gemini_api_key" || apiKey.includes("xxxxx") || apiKey === "") {
    console.log("AirNest Concierge: No valid GEMINI_API_KEY found. Using local fallback simulator...");
    return {
      text: simulateAIResponse(compiledPrompt),
      modelUsed: "local-simulation-fallback"
    };
  }

  for (const model of GEMINI_MODELS_FALLBACK) {
    try {
      console.log(`AirNest Concierge: Attempting evaluation with model: ${model}...`);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: compiledPrompt }] }]
        },
        { timeout: 8000 }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          text: response.data.candidates[0].content.parts[0].text,
          modelUsed: model
        };
      }
    } catch (error) {
      console.warn(`Model ${model} failed. Shifting to next fallback...`);
      lastError = error;
    }
  }

  console.log("AirNest Concierge: Gemini API calls exhausted or failed. Using local fallback simulator...");
  return {
    text: simulateAIResponse(compiledPrompt),
    modelUsed: "local-simulation-fallback"
  };
};

function simulateAIResponse(compiledPrompt) {
  const queryMatch = compiledPrompt.match(/User Query:\s*"([^"]+)"/i) || compiledPrompt.match(/USER_QUERY:\s*"([^"]+)"/i);
  const userQuery = queryMatch ? queryMatch[1].toLowerCase() : "";

  // Extract budget limit
  let budget = Infinity;
  const budgetMatch = userQuery.match(/(?:under|below|max|budget of)?\s*(?:₹|rs\.?\s*)?(\d+)/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1]);
  }

  // Extract guest count
  let guests = 1;
  const guestsMatch = userQuery.match(/(\d+)\s*(?:people|guests|person|members)/i);
  if (guestsMatch) {
    guests = parseInt(guestsMatch[1]);
  }

  // Parse listings inventory
  const lines = compiledPrompt.split("\n");
  const listings = [];

  for (const line of lines) {
    if (line.includes("Title:") || line.includes("ID:")) {
      const parts = line.split("|").map(p => p.trim());
      let title = "";
      let location = "";
      let maxGuests = 4;
      let price = 1000;
      let rating = 4.5;
      let amenities = [];

      for (const part of parts) {
        if (part.startsWith("Title:")) {
          title = part.replace("Title:", "").trim();
        } else if (part.startsWith("ID:")) {
          // Skip or store ID
        } else if (part.startsWith("Location:")) {
          location = part.replace("Location:", "").trim();
        } else if (part.includes("Max Guests:")) {
          const m = part.match(/Max Guests:\s*(\d+)/i);
          if (m) maxGuests = parseInt(m[1]);
        } else if (part.includes("Price:")) {
          const m = part.match(/Price:\s*(?:₹)?\s*(\d+)/i);
          if (m) price = parseInt(m[1]);
        } else if (part.includes("Rating:")) {
          const m = part.match(/Rating:\s*([\d.]+)/i);
          if (m) rating = parseFloat(m[1]);
        } else if (part.includes("Amenities:")) {
          amenities = part.replace("Amenities:", "").trim().split(",").map(a => a.trim());
        } else if (part.includes("₹")) {
          const m = part.match(/₹\s*(\d+)/);
          if (m) price = parseInt(m[1]);
        }
      }

      // Positional fallbacks for fields if labels were omitted
      if (!title && parts[0]) {
        title = parts[0].replace("ID:", "").replace("Title:", "").trim();
      }
      if (!location && parts[1]) {
        location = parts[1].replace("Location:", "").trim();
      }

      if (title) {
        if (amenities.length === 0) {
          const tLower = title.toLowerCase();
          if (tLower.includes("beach") || tLower.includes("pool")) {
            amenities = ["Pool", "Beach Access", "WiFi"];
          } else if (tLower.includes("cabin") || tLower.includes("wood") || tLower.includes("mountain")) {
            amenities = ["Fireplace", "Mountain View", "WiFi"];
          } else {
            amenities = ["WiFi", "Kitchen", "AC"];
          }
        }
        listings.push({ id: title, title, location, maxGuests, price, rating, amenities });
      }
    }
  }

  // Filter 1: Capacity Bounds
  let filtered = listings.filter(l => l.maxGuests >= guests);

  // Filter 2: Budget Ceiling
  let budgetFiltered = filtered.filter(l => l.price <= budget);
  let recommendations = budgetFiltered.length > 0 ? budgetFiltered : filtered;

  // Filter 3: Location Match
  const potentialLocations = Array.from(new Set(listings.map(l => l.location.toLowerCase())));
  const foundLocation = potentialLocations.find(loc => userQuery.includes(loc));
  if (foundLocation) {
    const locFiltered = recommendations.filter(l => l.location.toLowerCase().includes(foundLocation));
    if (locFiltered.length > 0) {
      recommendations = locFiltered;
    }
  }

  // Sort by rating descending
  recommendations.sort((a, b) => b.rating - a.rating);

  // Take top 2
  const top2 = recommendations.slice(0, 2);

  let output = "#### 🏢 Match Level: Optimal Stays\n\n";

  if (top2.length === 0) {
    output += `##### 🏡 No properties matching constraints found
* **Financial Metric:** N/A
* **Target Vectors:** N/A
* **Algorithmic Justification:** No available property matches the guest count capacity constraint (${guests} guests) or budget bounds.\n\n`;
  } else {
    top2.forEach((l, index) => {
      const justification = `Satisfies requested traveler count of ${guests} (maximum capacity: ${l.maxGuests}) and fits price parameter of ₹${l.price}/night against budget limit of ₹${budget}.`;
      output += `##### 🏡 ${l.title}\n`;
      output += `* **Financial Metric:** ₹${l.price}/night | **Rating:** ⭐ ${l.rating}\n`;
      output += `* **Target Vectors:** ${l.amenities.slice(0, 3).join(", ")}\n`;
      output += `* **Algorithmic Justification:** ${justification}\n\n`;
    });
  }

  output += "---\n\n#### 💬 Conversational Vector Refinement\n";
  if (!foundLocation) {
    output += `I noticed that the target destination was not specified. Could you specify which city or region you are traveling to?`;
  } else {
    output += `Would you prefer a property closer to nightlife or a secluded retreat?`;
  }

  return output;
}

module.exports = { fetchAIAnalysisWithFallback };
