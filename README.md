# RealChat - Real-Time Messaging App

A beautifully designed, real-time chat application built with **React Native (Expo)** for the mobile frontend, and **Node.js + Socket.io** for the backend, powered by **Supabase**.

## 🚀 Getting Started

Follow these steps to get the app running locally on your machine.

### 1. Database Setup (Supabase)
1. Go to your Supabase dashboard and open the SQL Editor.
2. Copy the contents of the `schema.sql` file and run it to create the `users` and `messages` tables.
3. Open the `.env` file in the root folder and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

### 2. Run the Backend (Server)
Open a terminal in the root folder of the project, then run:

```bash
cd backend
npm install
node server.js
```
*You should see "Server running on port 3000" and "Supabase JS Client initialized". Keep this terminal open!*

### 3. Run the Frontend (Mobile App)
Open a **new** terminal in the root folder of the project, then run:

```bash
cd frontend
npm install
npx expo start
```
*Once Expo starts, press `w` to open it in a web browser, `a` for Android Emulator, or scan the QR code with the Expo Go app on your physical phone.*

---

## 🎨 Features
- **Real-Time Messaging:** Instant private messaging using Socket.io.
- **Beautiful UI:** A modern, asymmetrical design with custom chat bubbles and curved headers.
- **Direct Database Integration:** Uses `@supabase/supabase-js` to store and retrieve message history seamlessly.
- **Dummy Auth:** Simply type a username on launch to instantly join and start chatting.
