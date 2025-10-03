# Social Media Aggregator
A backend system that fetches and analyzes data from **GitHub** and **Reddit** using their official APIs. This project aggregates issues and posts, identifies top authors, and provides analytics via REST APIs.

---

## 🚀 Project Info

* **Hosted on Netlify** ✅
* **Live App**: [https://socialmediaaggregator.netlify.app/](https://socialmediaaggregator.netlify.app/)
* **Tech Stack**: Node.js · TypeScript · React · Vite · shadcn-ui · Tailwind CSS · Supabase

---

## ⚡ Features

**GitHub Analytics:**

* Fetch all issues from specified repositories
* Top 5 GitHub issues by comment count
* Author with the most GitHub issues across all repositories
* Repository with the most open issues

**Reddit Analytics:**

* Fetch posts from specified subreddits
* Top 5 Reddit posts by upvotes
* Reddit author with the highest total upvotes across their posts

**Backend & System Features:**

* REST APIs for fetching GitHub and Reddit analytics
* Data caching for performance
* Scheduled background tasks to keep data updated
* Proper API authentication and error handling
* Scalable design with indexing and efficient queries

---

## 🛠️ Development Setup

Make sure you have **Node.js** and **npm** installed.

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate into the project directory
cd social-media-aggregator

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

---

## 🌍 Deployment

This project is **hosted on Netlify**:
👉 [https://socialmediaaggregator.netlify.app/](https://socialmediaaggregator.netlify.app/)

To deploy your own version:

* Create a Netlify account
* Link this GitHub repository
* Configure build command: `npm run build`
* Configure publish directory: `dist/`

---

## 🔗 Custom Domain

You can connect a custom domain via Netlify:

* Go to **Netlify Dashboard → Domain Settings**
* Add your custom domain and configure DNS
* Netlify provides free HTTPS via Let’s Encrypt

---

## 📂 Folder Structure

```
social-media-aggregator/
├── src/              # Application source code
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page-level components
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities and API clients
│   └── App.tsx       # Root application entry
├── supabase/         # Supabase configuration (if used)
├── package.json      # Dependencies and scripts
└── vite.config.ts    # Vite configuration
```

