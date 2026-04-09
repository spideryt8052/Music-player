# Music Player App - Feature Documentation

## 🎵 Features

### 1. **Search Feature** 🔍
- **Endpoint**: `/api/songs?search=...`
- **Description**: Search songs by title, artist, or genre
- **Frontend**: `Search.js` component with debounced input
- **Features**:
  - Real-time search with 500ms debounce
  - Displays play count for each song
  - Click to select and play

### 2. **Upload Songs** 📁 (Admin Only)
- **Endpoint**: `POST /api/songs` (with Multer file upload)
- **Description**: Upload audio files (MP3, WAV, OGG, WebM)
- **Frontend**: `Upload.js` component
- **Features**:
  - File validation (size limit: 50MB, type validation)
  - Admin-only access
  - Form fields: Title, Artist, Genre, Duration
  - Success/Error notifications via Toast

**Required Environment Variables**:
```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. **Analytics** 📊
- **Endpoint**: `/api/songs/most-played?limit=10`
- **Description**: View statistics of most played songs
- **Frontend**: `Analytics.js` page
- **Features**:
  - Total songs count
  - Total plays across all songs
  - Top track ranking (🥇 🥈 🥉)
  - Adjustable limit (5, 10, 20, 50 songs)
  - Uploader information

### 4. **Toast Notifications** 🔔
- **Component**: `Toast.js`
- **Types**: success, error, info, warning
- **Features**:
  - Auto-dismiss after 3 seconds
  - Animated slide-in effect
  - Progress bar indicator
  - Fully responsive

### 5. **Responsive Design** 📱
- **Features**:
  - Mobile-first approach
  - Breakpoints: 768px, 600px
  - Touch-friendly buttons and inputs
  - Collapsible navigation menu
  - Adaptive layouts for all components

### 6. **Player Controls**
- **Features**:
  - Play/Pause toggle
  - Next/Previous navigation
  - Shuffle mode
  - Repeat mode (Off, All, One)
  - Progress bar with seek
  - Volume control
  - Current time display

---

## 📂 File Structure

### Backend
```
server/
├── config/
│   └── db.js                 (MongoDB connection)
├── models/
│   ├── User.js              (Updated with isAdmin)
│   ├── Song.js              (Updated with playCount, uploadedBy)
│   ├── Playlist.js
│   ├── Favorite.js
│   └── Recent.js
├── controllers/
│   ├── songController.js    (Updated with search & upload)
│   ├── authController.js
│   ├── playlistController.js
│   ├── favoriteController.js
│   └── recentController.js
├── routes/
│   ├── songRoutes.js        (Updated with Multer & endpoints)
│   ├── authRoutes.js
│   ├── playlistRoutes.js
│   ├── favoriteRoutes.js
│   └── recentRoutes.js
├── middleware/
│   └── authMiddleware.js
├── utils/
│   └── generateToken.js
├── uploads/                 (Static folder for uploaded files)
├── server.js               (Updated to serve uploaded files)
└── package.json            (Updated dependencies)
```

### Frontend
```
client/
├── src/
│   ├── components/
│   │   ├── Navbar.js       (Updated with navigation)
│   │   ├── Player.js       (Full player with all controls)
│   │   ├── Search.js       (New search component)
│   │   ├── Upload.js       (New upload component)
│   │   ├── SongCard.js
│   │   ├── Loader.js
│   │   └── Toast.js        (New toast notifications)
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Analytics.js    (New analytics page)
│   │   └── ... other pages
│   ├── styles/
│   │   ├── darkMode.css     (Updated with global responsive styles)
│   │   ├── Player.css      (Full player styling)
│   │   ├── Search.css      (New search styling)
│   │   ├── Upload.css      (New upload styling)
│   │   ├── Analytics.css   (New analytics styling)
│   │   ├── Toast.css       (New toast styling)
│   │   └── Navbar.css      (Updated navbar styling)
│   ├── App.js              (Updated with all features)
│   └── index.js
└── package.json
```

---

## 🚀 Getting Started

### Backend Setup
```bash
cd server
npm install
npm run dev
```

**Environment Variables** (Create `.env` file):
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/musicplayer
JWT_SECRET=your_secret_key
PORT=5000
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

---

## 📡 API Endpoints

### Songs
- `GET /api/songs` - Get all songs (supports search query)
- `GET /api/songs?search=keyword` - Search songs
- `POST /api/songs` - Upload new song (Admin only, requires Multer file)
- `GET /api/songs/most-played` - Get most played songs (analytics)
- `GET /api/songs/:id` - Get song details
- `PUT /api/songs/:id/play` - Increment play count

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

---

## 🎨 UI Components

### Toast Notification Example
```javascript
<Toast 
  message="Song uploaded successfully!" 
  type="success" 
  duration={3000}
  onClose={() => console.log('closed')}
/>
```

### Search Component Example
```javascript
<Search onSearch={(song) => setCurrentSong(song)} />
```

### Upload Component Example
```javascript
<Upload 
  isAdmin={true} 
  onUploadSuccess={(msg) => showToast(msg, 'success')}
/>
```

---

## 🔐 Admin Features
- Set `isAdmin: true` in user model
- Admin can upload songs via Upload component
- Access restricted by checking `isAdmin` flag

---

## 📱 Responsive Breakpoints
- Desktop: 1024px and above
- Tablet: 768px - 1023px
- Mobile: 600px - 767px
- Small Mobile: Below 600px

---

## ✨ Key Dependencies

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `multer` - File upload
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing
- `cors` - Cross-origin support

### Frontend
- `react` - UI library
- `react-dom` - React rendering

---

## 🐛 Troubleshooting

### File Upload Not Working
- Check Multer configuration in `songRoutes.js`
- Ensure `uploads/` directory exists
- Verify file size < 50MB
- Check allowed MIME types

### Search Not Working
- Verify MongoDB indexes
- Check API endpoint format
- Ensure search query is URL-encoded

### Toast Not Showing
- Check if Toast component is imported in App.js
- Verify state management for toast visibility

---

## 📝 Notes
- All uploaded files are stored in `/uploads` directory
- Play count increments when song is played
- Analytics updates in real-time
- Search is case-insensitive with regex support

