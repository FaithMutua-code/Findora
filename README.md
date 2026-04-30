# Findora: Lost & Found, Campus-Simplified

Findora is a seamless Lost & Found mobile application designed specifically for university campuses. Built with **React Native (Expo)** and **Laravel**, it addresses the common issue of misplacing personal belongings on a sprawling university campus by creating a digital hub for listing and discovering found items.

This project is not just a tool; it's a testament to creating practical solutions with a modern, cross-platform technology stack.

---

## Table of Contents
- About the Project
- Key Features
- Screenshots & Mockups
- Project Tech Stack
- System Architecture
- Installation & Setup
- Future Scope
- Contributing

---

## About the Project

On a university campus, hundreds of items are lost daily—keys, phones, wallets, notebooks. The traditional "physical lost and found box" at the security desk is inefficient. Finder-to-owner connections are slow and often never made.

**Findora digitizes this entire process.** It allows students to:

- Instantly post an item they’ve found, with photos and locations.
- Quickly search a centralized feed for items they’ve lost.
- Filter listings by item category (Keys, Electronics, Bags, etc.).
- Securely communicate with finders.

The app is built to be fast, reliable, and available on both Android and iOS devices, thanks to React Native. The backend, powered by Laravel, ensures robust data management and security.

---

## Key Features

### User Accounts (Authentication)
- Registration & Login: Secure account creation.
- Password Reset: Seamless recovery process via email OTP.

### Item Management (The Feed)
- Post Item: Add found items with photos, title, description, and location.
- Item Feed: Real-time, filterable list of reported items.
- Status Tags: Items labeled as "Found".
- Share Item: Deep linking support for WhatsApp and social media.

### Search & Discovery
- Unified Search Bar: Search by name, category, or location.
- Filters: Quick filtering by item type.

### Communication
- Finder Messaging: Direct P2P chat linked to each item.

### User Experience (UX/UI)
- Dark/Light Mode: System-responsive theme switching.
- Profile Management: View and edit user details.

### Smart Matching (Beta)
- Rule-based system suggesting matches based on location and category overlap.

---

## Screenshots & Mockups

The mockup showcases all key user flows in a modern dark-themed interface:

- Welcome Screen: Clean entry point with modern design.
- Authentication: Login and secure access flow.
- Password Reset: OTP verification and password recovery.
- Home Dashboard: Quick stats and navigation hub.
- Items Feed: Searchable and filterable list of found items.
- Item Details: Full item info with messaging CTA.
- Profile Screen: User settings and theme toggle.
- Chat Screen:for Real_time communicaton

---

## Project Tech Stack

### Frontend (Mobile App)
- React Native
- Expo
- React Navigation
- Redux / Context API
- Vector Icons

### Backend (API)
- Laravel (REST API)
- MySQL
- Composer
- Eloquent ORM

---

## System Architecture

Frontend (React Native App)  
⬇  
REST API (Laravel Backend)  
⬇  
MySQL Database

---

## Installation & Setup

### Prerequisites
Make sure you have installed:

- Node.js
- Expo CLI (`npm install -g expo-cli`)
- PHP
- Composer
- MySQL

---

## Step 1: Backend Setup (Laravel API)

```bash
git clone <backend-repo-url>
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure `.env`:
```
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

Run migrations:

```bash
php artisan migrate --seed
```

Start server:

```bash
php artisan serve
```

Backend runs at:
```
http://localhost:8000
```

---

## Step 2: Frontend Setup (React Native Expo)

```bash
git clone <frontend-repo-url>
cd frontend
npm install
```

Update API URL in config:

```js
const API_URL = "http://YOUR_IP_ADDRESS:8000";
```

Start Expo:

```bash
npx expo start
```

Scan QR code using Expo Go.

---

## Future Scope

- Map View for item locations
- Item verification system
- Push notifications
- AI-based smart matching
- Admin dashboard for campus security

---

## Contributing

Contributions are welcome!

If you'd like to improve Findora:

- Fork the repo
- Create a feature branch
- Submit a pull request

---

## License

This project is open-source for educational and portfolio purposes.

