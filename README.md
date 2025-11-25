# MoodScape Travel Planner 🌍

**MoodScape** is an AI-powered travel planner that suggests personalized travel destinations and activities based on your mood. Using **Google’s Gemini AI** and location-based data, MoodScape provides curated recommendations for five core experience types: **adventurous**, **relaxed**, **romantic**, **curious**, and **budget-friendly**.

![MoodScape Preview](public/icon.png)

---

## 🌟 Features

* **Mood-Based Suggestions:** Instantly categorize your trip and receive personalized ideas aligning with Adventurous, Relaxed, Romantic, Curious, or Budget-Friendly vibes.
* **Contextual Planning:** Leverages **Function Calling** to provide real-time, mood-aligned information like **current weather** and **personalized accommodation suggestions** for specific locations.
* **Location-Aware:** Uses optional client-side geolocation data to ground travel suggestions and plans in real-world proximity.
* **Dynamic UI:** Animated, interactive mobile-frame style interface with mood-themed backgrounds using CSS variables and animations.
* **Real-time Chat:** Interact with the AI seamlessly to refine your travel plans.

---

## 📂 Project Structure

```
backend/
  ├─ node_modules/ # npm dependencies
  ├─ public/ # Static assets (icons, images)
  | └─ icon.png # App Logo (used in the header)
  | └─ style.css # Frontend styling, theme colors, and animations
  | └─ index.html # Main chat interface
  | └─ script.js # Frontend logic (chat handling, API calls, UI effects)
  ├─ .env # Environment variables (MUST be ignored by Git)
  ├─ .gitignore # Git ignore file
  ├─ package.json # npm package configuration and scripts
  ├─ server.js # Node.js backend: Express server, Gemini client init, Function Calling logic
```

---

## 🛠️ Prerequisites

* **Node.js v20+**
* **npm**
* A **Gemini API Key** from Google AI Studio.

---

## 🚀 Setup Instructions

1.  **Clone the repository**

    ```bash
    git clone <repo-url>
    cd moodscape-backend
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure API Key**

    Create a file named **`.env`** in the project root and paste your Gemini API Key:

    ```
    # Get your key from Google AI Studio: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    PORT=3000
    ```

4.  **Run the server**

    ```bash
    npm start
    ```

5.  **Open the frontend**

    * The server will run on port 3000.
    * Visit **`http://localhost:3000/index.html`** (or just `http://localhost:3000` if you configure Express to serve the root).

6.  **Start Planning!**

    * Select your mood (e.g., **Relaxed**).
    * Ask a question like "What should I do in Mangalore if I want an adventurous trip?"

---

## 💻 Technologies Used

* **Backend:** Node.js, Express, **`@google/genai`** (for Gemini API)
* **AI Model:** **Gemini 2.5 Flash** (with **Function Calling** for data retrieval)
* **Frontend:** Vanilla JavaScript, HTML, **Tailwind CSS** (via CDN for rapid styling)

---

## 💡 Future Enhancements

* Integrate actual booking APIs (e.g., Google Maps Platform, hotel search providers).
* Add user accounts for saving trips.
* Enhance UI animations and theme transitions.
* Add multi-language support.
