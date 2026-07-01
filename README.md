# Gym Tracker App

A lightweight, self-contained workout tracking application built with React and Vite. Log weightlifting sessions with sets, reps, and weight, track exercise progress with visual charts, manage workout splits, and use a built-in rest timer—all persisted locally in your browser.

## ✨ Features

### 📋 Workout Management
- **Preset Splits**: Choose from 4 pre-built workout programs:
  - Push / Pull / Legs / Rest (4-day)
  - Upper / Lower (2-day)
  - Bro Split (5-day)
  - Full Body (3-day)
- **Custom Split Builder**: Create your own splits with custom blocks and exercises
- **Block Rotation**: Automatically rotates through blocks as you log workouts

### 📊 Session Logging & History
- **Set-by-Set Logging**: Log weight, reps, and notes for each set
- **Performance Badges**: See if you beat or missed your previous best on each exercise
- **Session History**: Browse all logged sessions with detailed exercise breakdowns
- **Delete Sessions**: Remove sessions to correct mistakes or manage history

### 📈 Progress Tracking
- **Exercise Timeline Chart**: SVG-based visualization of your exercise performance over time
- **Best Lift Display**: Quick view of your highest weight and rep count
- **Session Comparison**: Compare current performance against your last session for each exercise
- **Previous Session Reference**: Always see your last best set while logging

### ⏱️ Rest Timer
- **Preset Intervals**: 30 seconds, 1 minute, 2 minutes, 3 minutes, 4 minutes
- **Slider Control**: Smooth slider to select your rest duration
- **Audio Alert**: Beep notification when rest time expires
- **Pause & Reset**: Pause mid-rest or reset to start over

### 💾 Data Persistence
- **100% Local Storage**: All workouts, splits, and settings saved in your browser
- **No Server Required**: Use offline, no account needed
- **Automatic Saves**: Changes sync to localStorage instantly

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Clone or download the repository:**
   ```bash
   git clone https://github.com/yourusername/gymapp.git
   cd gymApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |

---

## 📱 How to Use

### Logging a Workout

1. Select a preset split or your custom split from the buttons at the top
2. Click on the current block (e.g., "Push") to start logging
3. For each exercise:
   - Click "+ Add set" to log a new set
   - Enter weight, reps, and optional notes
   - See your previous best set displayed for reference
   - Remove sets with the "Remove" button if needed
4. Use the rest timer between sets:
   - Set your rest duration with the slider (30s–4m)
   - Click "Start" to begin countdown
   - Beep plays when time is up
5. Click "Save session" when complete
6. The next block becomes active for your next workout

### Tracking Progress

1. **Exercise Progress**: Select an exercise from the dropdown to view your timeline chart
2. **Session History**: Browse past sessions in the session history panel
3. **Session Details**: Click any session to expand and review all exercises and sets
4. **Delete Session**: Remove a session by clicking "Delete session"

### Building a Custom Split

1. Click "+ Create custom split"
2. Set your split name and add blocks (e.g., Chest, Back, Legs)
3. Assign exercises to each block
4. Save and use like any preset split

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

**Option 1: GitHub Integration**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Vercel auto-detects the setup and deploys automatically
6. Your app is live on a `.vercel.app` domain

**Option 2: Vercel CLI**
```bash
npm install -g vercel
vercel
```
Follow the prompts to link and deploy.

**Option 3: Other Platforms**
Since this is a static Vite build, you can deploy to any static host:
- Netlify: Connect GitHub repo, auto-deploys on push
- GitHub Pages: Build locally and push `dist/` folder
- Any static host: Upload the `dist/` folder

**No environment variables needed.** Everything runs in the browser.

---

## 🏗️ Project Structure

```
gymApp/
├── src/
│   ├── App.jsx              # Main app component (splits, logging, history, timer)
│   ├── main.jsx             # React entry point
│   ├── index.css            # Tailwind styles
│   └── data/
│       └── models.js        # Data models, preset splits, sample sessions
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── vercel.json              # Vercel deployment config
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
├── package.json             # Dependencies
└── README.md                # This file
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework and state management |
| **Vite 5** | Lightning-fast build tool and dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **localStorage API** | Client-side data persistence |

---

## 💡 Tips & Tricks

- **Keyboard shortcuts**: Use Tab to move between inputs in the logging form
- **Edit splits**: Create multiple custom splits for different training phases
- **Reset data**: Open browser DevTools → Application → Local Storage → delete `gym-app-state-v1` to reset
- **Export data**: Manually copy sessions from localStorage or take screenshots of session history
- **Offline mode**: Works completely offline after first load (all data local)

---

## 📋 Data Storage

All app data is stored in a single localStorage key: `gym-app-state-v1`

Stored data includes:
- Active splits and custom splits
- All logged sessions with exercise sets
- Selected split preference
- Timer preferences

**Privacy**: No data is sent to any server. Everything stays on your device.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Data disappeared after refresh | Check browser privacy settings; localStorage may be disabled or cleared |
| Timer not playing sound | Ensure browser hasn't muted audio; check browser audio permissions |
| Can't save custom split | Verify split has at least one block with exercises |
| App looks broken on mobile | Try zooming out or rotating device; tested on modern mobile browsers |

---

## 🚀 Future Enhancements

Potential features for future versions:
- PR (Personal Record) tracking by exercise
- Volume statistics and charts
- Body-part heatmap showing muscle group frequency
- Optional bodyweight tracking
- Export/import data as JSON
- Workout templates and quick-log presets
- Dark/light theme toggle
- Cloud sync option

---

## 📄 License

MIT License - feel free to use, modify, and distribute.

---

## 👤 Author

Built as a personal workout tracking app. Questions or suggestions? Feel free to submit feedback!

---

**Happy lifting! 🏋️**
