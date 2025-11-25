import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize the Gemini client
const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// System Instruction to guide the model's behavior**
const SYSTEM_INSTRUCTION = `You are MoodScape, an AI-powered travel planner powered by Google’s Gemini AI that delivers personalized, mood-aligned travel destinations and activities using location-based data. You specialize in curating experiences for 5 core mood types: adventurous, relaxed, romantic, curious, and budget-friendly.
0. **STRICT SCOPE:** If the user asks a question unrelated to travel, destinations, accommodation, weather, local activities, or mood-aligned travel planning, you MUST provide only a single polite disclaimer sentence and then immediately ask a relevant follow-up question to return to mood-based travel planning. **DO NOT include any travel suggestions or lists in this case.** Example disclaimer: "I’m only able to assist with mood-aligned travel planning—would you like to share what kind of travel experience you’re in the mood for?"
1.**ANALYSIS & MOOD:** Before replying, analyze the user's latest message to explicitly identify their underlying mood (aligning with adventurous, relaxed, romantic, curious, or budget-friendly where possible), sentiment, and intent. Leverage Google’s Gemini AI and any shared location data to ground this analysis in accurate, real-world travel context.
2.**PERSONALIZATION:** Use your mood/sentiment analysis, chat history, and location-based data to categorize the trip into one of MoodScape’s core experience types (or a tailored hybrid) and ensure all recommendations are fully aligned with this categorization.
3.**FORMAT/PLANNING:**
* **If the user names a single, specific destination:** Immediately use Google’s Gemini AI to provide a detailed, mood-aligned plan or actionable, hyper-relevant information about that place (e.g., mood-matched activities, optimal visit timings, dress code, budget-friendly hacks, romantic hidden gems, adventurous trail routes). **Do not offer alternative destinations.**
* **If no specific destination is named:** List your top 5-6 curated, location-aware, mood-aligned suggestions using a hyphenated bullet list formatted exactly as: - **Place Name:** Brief, mood-specific description that highlights how it fits the user’s identified vibe (e.g., "Perfect for curious travelers looking to explore ancient Mayan ruins and sample traditional Yucatecan street food").
4.**ENGAGEMENT:** **ALWAYS** end your response with a concise, relevant follow-up question tied to the user’s mood, preferences, or travel plans. If the user provides a vague response (like "ok" or "yes") to a multi-choice or recommendation prompt, politely ask them to specify their preferred mood, destination, or activity to refine your curated suggestions.
5.**FOCUS:** Prioritize the user’s explicit specific destination request above all else. If no specific destination is provided, center your recommendations on the user’s identified mood and available location data, using Google’s Gemini AI to ensure insights are curated, up-to-date, and tailored to their needs.`

function get_current_weather(location) {
    // Simple logic based on location name (case-insensitive)
    if (location.toLowerCase().includes("mangalore") || location.toLowerCase().includes("mangaluru")) {
        return {
            "location": location,
            "temperature": "30°C",
            "condition": "Partly cloudy with high humidity",
            "forecast_note": "Risk of afternoon showers. Best to plan outdoor activities for the morning."
        };
    } else if (location.toLowerCase().includes("st. mary's island") || location.toLowerCase().includes("malpe")) {
        return {
            "location": location,
            "temperature": "28°C",
            "condition": "Sunny, but windy near the coast",
            "forecast_note": "Ferries running smoothly, but stay hydrated. Expect high UV."
        };
    } else {
        return {
            "location": location,
            "temperature": "25°C",
            "condition": "Unknown",
            "forecast_note": "Cannot fetch real-time weather. Please check a reliable source."
        };
    }
}
// --- In server.js, with your other function definitions ---

function find_personalized_accommodation(location, mood_category, budget_max) {
    // NOTE: This function would connect to a database or a Hotel Booking API.
    
    // Mock Logic for demonstration
    if (mood_category.toLowerCase().includes("romantic") && budget_max >= 5000) {
        return {
            "hotel_name": "The Serene Getaway Villa",
            "type": "Luxury Boutique",
            "price_per_night": 7500,
            "reason": "Offers private cabanas and couples spa packages perfect for romantic seclusion."
        };
    } else if (mood_category.toLowerCase().includes("budget") || budget_max < 2000) {
        return {
            "hotel_name": "Coastline Backpackers Hostel",
            "type": "Budget-Friendly Stay",
            "price_per_night": 900,
            "reason": "Best value near Malpe Beach with great community vibes for solo travelers."
        };
    } else {
         return {
            "hotel_name": "Hotel Ocean View Residency",
            "type": "Mid-Range Comfort",
            "price_per_night": 3000,
            "reason": "Highly rated, central location for easy access to trekking and city sights."
        };
    }
}

const find_personalized_accommodation_declaration = {
    name: "find_personalized_accommodation",
    description: "Suggests a specific hotel or accommodation that matches the user's mood and budget.",
    parameters: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "The city or area the user is traveling to.",
            },
            mood_category: {
                type: "string",
                description: "The derived mood or trip category (e.g., 'Luxury', 'Budget', 'Romantic').",
            },
            budget_max: {
                type: "number",
                description: "The maximum budget the user has mentioned for accommodation (in Indian Rupees, INR).",
            },
        },
        required: ["location", "mood_category", "budget_max"],
    },
};

// 2. Define the Gemini function declaration (Schema)
const get_current_weather_declaration = {
    name: "get_current_weather",
    description: "Gets the current weather for a specific location to inform travel plans or adjustments.",
    parameters: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "The city or specific landmark to get the weather for, e.g., 'Mangaluru' or 'St. Mary's Island'",
            },
        },
        required: ["location"],
    },
};

// 3. Map function names to their actual implementations (CORRECTED LINE)
const availableFunctions = {
    get_current_weather: get_current_weather,
    find_personalized_accommodation: find_personalized_accommodation,
};

// Retry helper (Removed for simplicity, not needed in final API logic)
async function sendWithRetry(prompt, maxRetries = 3, delay = 1000) {
}

// --- Modified API Endpoint ---
app.post('/api/chat', async (req, res) => {
    const { chatHistory, location } = req.body;
    let history = [...chatHistory];
    
    const config = {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{
            functionDeclarations: [
                get_current_weather_declaration,
                find_personalized_accommodation_declaration 
            ],
        }]
    };

    // --- Prepare Augmented Prompt (Same as before) ---
    const lastUserMessage = history[history.length - 1].parts[0].text;
    const locationInfo = location ? ` (User is near latitude: ${location.lat}, longitude: ${location.lon}. Suggest travel ideas nearby.)` : '';
    const augmentedMessage = lastUserMessage + locationInfo;

    // Replace the last message in history with the augmented one for the model
    history[history.length - 1].parts[0].text = augmentedMessage;

    try {
        let modelResponse = null;

        // --- PHASE 1: Send Request with Tools ---
        const initialResponse = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: history,
            config: config,
        });

        // Check if the model decided to call a function
        const functionCall = initialResponse.functionCalls?.[0];

        if (functionCall) {
            // --- PHASE 2: Execute Function ---
            const functionName = functionCall.name;
            const functionArgs = functionCall.args;

            if (availableFunctions[functionName]) {
                const functionToCall = availableFunctions[functionName];
                
                // CRITICAL: Determine which function to call and how to pass arguments
                let functionResult;
                if (functionName === 'get_current_weather') {
                    functionResult = functionToCall(functionArgs.location);
                } else if (functionName === 'find_personalized_accommodation') {
                    functionResult = functionToCall(functionArgs.location, functionArgs.mood_category, functionArgs.budget_max);
                }
                
                // --- PHASE 3: Send Function Result Back to Gemini ---
                history.push(
                    initialResponse.candidates[0].content, // Add the model's request to call a function
                    {
                        role: 'function',
                        parts: [{
                            functionResponse: {
                                name: functionName,
                                response: functionResult,
                            }
                        }]
                    }
                );

                // --- PHASE 4: Get Final Response ---
                modelResponse = await aiClient.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: history,
                    config: config,
                });

            } else {
                modelResponse = { text: `Error: Unknown function requested: ${functionName}` };
            }
        } else {
            // No function call, use the initial response
            modelResponse = initialResponse;
        }

        // --- Final Response Handling (Same as before) ---
        const botText = modelResponse.text;
        const sources = modelResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        // Save the final model response to the chat history
        history.push({ role: 'model', parts: [{ text: botText }] });

        res.json({ botText, sources });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to communicate with the AI model.' });
    }
});


app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});