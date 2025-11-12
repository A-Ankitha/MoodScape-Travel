# MoodScape Travel Planner

**MoodScape** is an AI-powered travel planner that suggests personalized travel destinations and activities based on your mood. Using Google’s Gemini AI and location-based data, MoodScape provides curated recommendations for adventurous, relaxed, romantic, curious, and budget-friendly travel experiences.

![MoodScape Preview](backend/public/icon.jpg)

---

## Features

* **Mood-based suggestions:** Choose from Adventurous, Relaxed, Romantic, Curious, or Budget-friendly.
* **Location-aware:** Suggests travel destinations and activities near your current location.
* **Dynamic UI:** Animated, interactive mobile-frame style interface with themed backgrounds.
* **Real-time chat:** Interact with AI in a chat interface to plan trips seamlessly.
* **Safe and modular:** Uses environment variables and a service account for secure API access.

---

## Project Structure

```
backend/
├─ credentials/                 # Store service account JSON here (ignored by Git)
│  └─ service-account.json
├─ node_modules/                # npm dependencies
├─ public/                      # Static assets (icons, images)
│  └─ icon.jpg
|  └─ style.css                 # Styles including theme colors & animations
|  └─ index.html                # Frontend HTML
|  └─ script.js                 # Frontend JS
├─ .env                         # Environment variables (not committed)
├─ .gitignore                   # Git ignore file
├─ package.json                 # npm package configuration
├─ server.js                    # Node.js backend server

```

---

## Prerequisites

* Node.js v20+
* npm
* Google Cloud project with **Vertex AI / Generative AI API** enabled

---

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repo-url>
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Add environment variables**

Create a `.env` file with:

```
GEMINI_API_KEY='your-gemini-api-key'
GOOGLE_APPLICATION_CREDENTIALS='./credentials/moodscape-service-account.json'
```

4. **Download Service Account JSON**

* Go to Google Cloud → IAM & Admin → Service Accounts.
* Create a service account for Vertex AI / Generative AI.
* Assign roles: `Vertex AI User` or `Vertex AI Admin` (for full access).
* Download the JSON and place it in `credentials/`.

> **Important:** Add this to `.gitignore`:

```
credentials/
```

5. **Run the server**

```bash
npm start
```

6. **Open the frontend**

* Visit [http://localhost:3000](http://localhost:3000) in your browser.
* Select a mood and start chatting with the AI to get travel suggestions.

---

## Technologies Used

* Node.js + Express
* Google Gemini AI (via @google/genai)
* Tailwind CSS
* Vanilla JavaScript, HTML & CSS
* Google Maps / Location API (for geolocation suggestions)

---

## Future Enhancements

* Integrate booking APIs for hotels, flights, and experiences
* Add user accounts for saving trips
* Enhance UI animations and theme transitions
* Add multi-language support
