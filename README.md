# 🏥 WaitlessOS – Your AI-Powered Healthcare Companion
## 💡  Inspiration 

As an international students, we often hesitated to visit a clinic or hospital in Canada. Unlike permanent residents with OHIP, we have UHIP or private plans that aren’t accepted everywhere, and coverage varies greatly. we constantly asking:

- “Will they accept my insurance?”

- “How much will I need to pay?”

- “Where is the nearest clinic that fits my situation?”

- “Should I go to the ER, urgent care, or just wait?”

This overwhelming uncertainty inspired the creation of WaitlessOS — an AI-powered platform that bridges the gap between patients, healthcare providers, and insurance systems in one seamless experience.

# 🎯 Purpose
WaitlessOS helps patients — especially newcomers, students, and visitors — make informed decisions about where, when, and how to seek care by:

- Classifying the urgency of symptoms using AI triage

- Showing the most relevant clinics/hospitals based on insurance, proximity, and availability

- Providing cost estimates and insurance coverage breakdowns

- Enabling instant booking, waitlist joining, and navigation

- Reducing decision friction, panic, and time wasted in emergencies

# ⚙️ Functionality
## Intelligent Triage
Users enter their symptoms and WaitlessOS:

- Uses Gemini AI API to assess urgency
- Suggests whether to go to ER, urgent care, or book a clinic

## Smart Search

- Filters clinics by insurance (e.g., UHIP, Blue Cross, Aetna)

- Ranks based on distance, ratings, and availability
- Supports real-time appointment visibility (with potential for API integration)

## Coverage & Cost Estimator
- Explains what your insurance covers

- Estimates out-of-pocket cost based on appointment type and plan

## Seamless Booking
- Book appointments or join waitlists directly in-app

- Integrates with Google Maps for directions and static maps

# 🛠️ Tech Stack
- Frontend: React, TailwindCSS, Vite

- Backend: Node.js, Express, TypeScript, MongoDB, Redis

- Google Maps API for geolocation and navigation

- Gemini (Generative AI) for symptom triage

- Authentication: JWT

# 📈 Impact
WaitlessOS has the potential to:

- Empower patients with clarity and control over their healthcare journey

- Reduce emergency room overcrowding by routing users appropriately

- Improve access for underrepresented groups like international students

- Streamline communication between clinics and patients

- If integrated with real healthcare APIs and patient records (with HIPAA compliance), it can evolve into a full-service telehealth system.

# 📚 What We Learned
## Technical Skills
- Handling secure, environment-based config loading (dotenv, .env)

- Using TypeScript for cleaner, safer backend logic

- Managing asynchronous logic across multiple services (MongoDB, Redis, Gemini)

- Implementing real-world rate limiting, logging, and error handling

## Personal Growth
- Navigating healthcare complexity

- Learning how insurance systems vary across user groups

- Developing a user-centric mindset for accessibility and urgency

# 🔥Challenges Faced
- Sensitive APIs: Some healthcare APIs require real authorization (e.g., Epic, Cerner) — hard to simulate in a hackathon setting.

- AI hallucination: Gemini sometimes gave vague triage results, so post-processing was needed.

- Map APIs: Managing markers, distance matrix, and fallback options in case of missing API keys

- Time limits: Building a full-stack app with AI integration in limited time required extreme prioritization

# 🤔 What Could Be Better?
- Mock real-time availability by scraping or simulating real APIs

- Add SMS reminders and in-app chat

- Use OAuth for better insurance account verification

- Provide multilingual support for immigrants

# 🧪 A Glimpse Into the Future
This project laid the groundwork for a smarter, more accessible healthcare ecosystem.

With more time and partnerships, I envision WaitlessOS as a real-time, trusted advisor that can:

- Predict wait times

- Support telehealth

- Securely integrate with EHR systems

- Serve vulnerable populations across the globe
