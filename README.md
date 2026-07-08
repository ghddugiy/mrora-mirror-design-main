# Mrora Website - Design & Digital Studio

This is the official codebase for the Mrora Studio website, built using **TanStack Start**, **React 19**, and styled with custom premium CSS rules.

---

## Getting Started

### 1. Prerequisites
Ensure you have **Node.js v20.6.0+** or later installed.

### 2. Installation
Install project dependencies:
```bash
npm install
```

### 3. Local Configuration
Create or update your `.env.local` file in the project root:
```env
# Web3Forms API Configuration
WEB3FORMS_ACCESS_KEY="26a462fa-b7a2-4f0c-ab05-18aa71803ff2"
```

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
Open **[http://localhost:8081](http://localhost:8081)** to preview the site.

---

## Email Integration (Web3Forms API)

The contact form dispatches visitor inquiries directly to your inbox using **Web3Forms** through a secure server-side API proxy.

### 1. Create a Free Web3Forms Account & Access Key
1. Visit **[Web3Forms.com](https://web3forms.com/)**.
2. Enter your email address in the registration box to register and receive your Access Key.
3. Check your inbox; Web3Forms will email you a unique Access Key (e.g. `26a462fa-b7a2-4f0c-ab05-18aa71803ff2`).
4. Place this Access Key inside your `.env.local` file as `WEB3FORMS_ACCESS_KEY`.

---

## Deploying on Vercel

1. Push your repository commits to GitHub.
2. Link the repository to your Vercel Dashboard.
3. Go to **Settings → Environment Variables** in your Vercel project dashboard.
4. Remove any legacy `SMTP_*` or `RESEND_API_KEY` / `CONTACT_EMAIL` environment variables.
5. Add the following new variable to **Production, Preview, and Development** environments:
   - **`WEB3FORMS_ACCESS_KEY`**: `26a462fa-b7a2-4f0c-ab05-18aa71803ff2` (or your custom Access Key).
6. Trigger a production redeployment to inject the new settings.
