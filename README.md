# 🍞 BUNTEE – Deployment Blueprint

A professional, mobile-first React application for the Buntee Bun Maska stall.

## 🚀 Quick Start Deployment

### 1. Git & GitHub
1. Initialize git: `git init`
2. Add files: `git add .`
3. Commit: `git commit -m "Buntee v1.0 Launch"`
4. Push to a new GitHub repository.

### 2. Firebase Setup
1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore** (Production mode).
3. Enable **Authentication** (Email/Password method) and create your admin account.
4. Copy your **Web API Key** from Project Settings.

### 3. Netlify Hosting (CRITICAL)
1. Import your GitHub repo to Netlify.
2. **Environment Variables**: Add a variable with key `API_KEY` and your Firebase Web API Key as the value.
3. **SPA Routing**: Ensure the `_redirects` file exists in your project root with the content: `/* /index.html 200`.

### 4. Admin Access
Navigate to `https://your-site.netlify.app/#/admin` to manage pre-bookings and event orders.

---
Developed with ❤️ for Buntee.