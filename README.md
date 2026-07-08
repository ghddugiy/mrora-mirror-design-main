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
# Resend API Configuration
RESEND_API_KEY="your_resend_api_key"
CONTACT_EMAIL="mroraaii11@gmail.com"
```

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
Open **[http://localhost:8081](http://localhost:8081)** to preview the site.

---

## Email Integration (Resend API)

The contact form dispatches visitor inquiries directly to your inbox using **Resend**.

### 1. Generating a Resend API Key
1. Sign up or log in at **[Resend.com](https://resend.com/)**.
2. Go to your Dashboard and select **API Keys** from the sidebar.
3. Click **Create API Key**, name it `Mrora Website`, select `Sending Access`, and click **Create**.
4. Copy the generated key (e.g. `re_...`) and place it as `RESEND_API_KEY` in your `.env.local` or Vercel settings.

### 2. Custom Domain Verification (Optional)
By default, emails send via Resend's testing sandbox `onboarding@resend.dev` and can only deliver to the email address associated with your Resend account. To send emails from a custom domain (e.g. `hello@mrora.com` to any recipient):
1. Navigate to **Domains** in the Resend dashboard.
2. Click **Add Domain**, enter your domain name, and configure the suggested DNS records (MX, SPF, DKIM) on your registrar.
3. Once verified, update the `from` field in `src/server.ts` to your verified address.

---

## Deploying on Vercel

1. Push your repository commits to GitHub.
2. Link the repository to your Vercel Dashboard.
3. Go to **Settings → Environment Variables** in your Vercel project dashboard.
4. Add the following keys:
   - `RESEND_API_KEY`: Your production Resend API key.
   - `CONTACT_EMAIL`: The recipient email address (e.g. `mroraaii11@gmail.com`).
5. Redeploy your project.
