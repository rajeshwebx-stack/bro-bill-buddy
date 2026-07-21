# 💇‍♂️ Look @ Me — Salon Billing & SaaS Ledger

A beautiful, premium, mobile-first SaaS billing ledger, expense tracker, and attendance system designed for modern salons and barbershops. Built with a stunning luxury dark glassmorphism design.

👉 **Live Demo:** [https://lookatme-salon.vercel.app](https://lookatme-salon.vercel.app)

---

## ✨ Features

- **🌐 White-Label SaaS Profile**: Easily customize the Shop/Salon name from the Settings page. The app header, page title, and footer update dynamically.
- **🛒 Dynamic Multi-Service Billing**: Live cart system allows selecting multiple services, applying custom pricing, and calculating running totals instantly.
- **👥 Worker Management**: Add new staff members, edit existing ones, or delete workers directly from the settings panel.
- **💇‍♂️ Customizable Services & Prices**: Define your own price list, edit service rates, or add custom salon treatments.
- **💸 Expense & Ledger System**: Log daily shop expenses and view automatic calculations comparing income vs. expenses.
- **📅 Interactive Reports**: High-level daily reports showing Total revenue, cash vs. GPay splits, worker-wise earnings, and comparison summaries.
- **📋 Attendance Tracker**: Simple daily check-in system for active staff members.
- **📱 PWA Mobile App Support**: Optimized for mobile screens and fully installable as an app directly from your browser.
- **🛡️ Secure Client-Side Storage**: All business data is securely saved directly on the client device's browser, with easy export/import backup options.

---

## 🛠️ Tech Stack

- **Framework**: [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [TanStack Router & Start](https://tanstack.com/router)
- **Styling**: Vanilla CSS with customized glassmorphism tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build & Hosting**: Optimized and ready for one-click [Vercel](https://vercel.com/) deployments

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/rajeshwebx-stack/bro-bill-buddy.git
   cd bro-bill-buddy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

---

## 📦 Building & Deployment

### Build for Production

To compile the project to production-ready static assets:
```bash
npm run build
```

### Vercel Deployment

This project includes build configurations customized for the Vercel platform. To build and deploy to Vercel:
```bash
npm run deploy
```

---

## 💾 Backups & Restore

Data is stored locally in the browser's `localStorage` namespace.
To move data to a different device or keep backup copies:
1. Go to **Settings** -> **Backup**.
2. Click **Export** to download your database as a `.json` backup file.
3. Click **Import** on the new device to restore your database.
