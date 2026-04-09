# 🎵 Music Player - Quick Start Guide

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies (if not already done)
npm install

# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# Start development server
npm run dev
```

Server runs on: `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies (if not already done)
npm install

# Start development server
npm start
```

Client runs on: `http://localhost:3000`

---

## ✨ New Features Overview

### 🔍 Search Songs
- Search by title, artist, or genre
- Real-time debounced search
- Click to play any song

### 📁 Upload Songs (Admin Only)
- Upload MP3, WAV, OGG, WebM files
- Set title, artist, genre, duration
- Max file size: 50MB
- Success notifications via Toast

### 📊 Analytics Dashboard
- View most played songs
- Total statistics
- Ranking with medals (🥇🥈🥉)
- Adjustable Top N songs

### 🔔 Toast Notifications
- Success, Error, Info, Warning types
- Auto-dismiss after 3 seconds
- Animated transitions

### 📱 Fully Responsive Design
- Mobile, tablet, and desktop support
- Touch-friendly interface
- Adaptive layouts

### ♪ Enhanced Player
- Play/Pause, Next/Previous
- Shuffle and Repeat modes
- Progress bar with seek
- Volume control
- Time display

---

## 🎮 How to Use

### Search for a Song
1. Click on the search box at the top
2. Type song title, artist, or genre
3. Results appear instantly (debounced)
4. Click any result to play

### Upload a Song (Admin)
1. Click "📁 Upload" in navbar (admin only)
2. Fill in song details (Title*, Artist*, Genre, Duration)
3. Select audio file (MP3/WAV/OGG/WebM)
4. Click "Upload Song"
5. See success notification when done

### View Analytics
1. Click "📊 Analytics" in navbar
2. View top songs, total plays, statistics
3. Select different rankings (Top 5/10/20/50)
4. See uploader information

### Control Player
1. **Play/Pause**: Click ▶️/⏸️ button
2. **Next/Previous**: Use ⏮️/⏭️ buttons
3. **Shuffle**: Click 🔀 to toggle
4. **Repeat**: Click 🔁 (cycles: Off → All → One)
5. **Volume**: Drag volume slider 🔊
6. **Seek**: Click/drag progress bar

---

## 🏗️ Project Structure

```
Music Player/
├── client/                 (React Frontend)
│   ├── src/
│   │   ├── components/    (Navbar, Player, Search, Upload, Toast)
│   │   ├── pages/         (Home, Login, Analytics, etc)
│   │   ├── styles/        (CSS files for all components)
│   │   ├── services/      (API calls)
│   │   ├── context/       (React Context)
│   │   ├── utils/         (Helper functions)
│   │   └── App.js         (Main app component)
│   └── package.json
│
└── server/                (Node.js Backend)
    ├── config/           (Database config)
    ├── models/           (MongoDB schemas)
    ├── routes/           (API routes)
    ├── controllers/      (Route handlers)
    ├── middleware/       (Auth middleware)
    ├── utils/            (Helper functions)
    ├── uploads/          (User uploaded files)
    ├── server.js         (Main server file)
    └── package.json
```

---

## 📚 API Endpoints Summary

### Songs API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/songs` | Get all/search songs |
| GET | `/api/songs/most-played` | Analytics - top songs |
| GET | `/api/songs/:id` | Get song details |
| POST | `/api/songs` | Upload new song |
| PUT | `/api/songs/:id/play` | Increment play count |

### Auth API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

---

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/musicplayer
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎯 Key Features

✅ Search songs with real-time results
✅ Admin upload songs with file validation
✅ Analytics dashboard with statistics
✅ Toast notifications (success/error/info)
✅ Fully responsive mobile design
✅ Player with shuffle & repeat modes
✅ Volume control & progress seeking
✅ Dark mode support
✅ Collapsible mobile menu
✅ Auto-increment play count

---

## 🚨 Common Issues & Solutions

### Issue: "File upload not working"
**Solution**: 
- Check if `uploads/` directory exists in server folder
- Create it manually if missing
- Verify file size < 50MB
- Check allowed MIME types

### Issue: "Search returns empty"
**Solution**:
- Ensure MongoDB is running
- Add some songs first
- Check API endpoint in browser console

### Issue: "Toast not appearing"
**Solution**:
- Import Toast in App.js
- Check if state is properly set
- Verify CSS file is imported

### Issue: "Upload shows Admin access required"
**Solution**:
- Set `isAdmin: true` in your user profile
- Implement proper authentication flow
- Check user context/state

---

## 📞 Support & Notes

- Frontend runs on port **3000**
- Backend runs on port **5000**
- Both must be running for full functionality
- Use MongoDB Atlas for cloud database
- Keep JWT_SECRET secure in production

---

## 🎉 You're All Set!

Enjoy your Music Player with all the new features! 🎵

