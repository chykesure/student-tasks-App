# 📚 Student Task Management App

A full-stack mobile application that helps students plan their daily and weekly academic activities, receive reminders, and track their progress.

## 🏗️ Project Structure

```
student-task-app/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   ├── models/             # Mongoose models (User, Task)
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── server.js           # Entry point
│   └── package.json
│
└── mobile/                  # Expo React Native App
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── constants/      # App constants & config
    │   ├── context/        # React Context (Auth)
    │   ├── navigation/     # React Navigation setup
    │   ├── screens/        # App screens
    │   ├── services/       # API & Notification services
    │   └── utils/          # Helper functions
    ├── App.js              # Entry point
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free tier works)
- Android Studio (for Android emulator) OR physical device with Expo Go app
- VS Code (recommended)

---

## 📱 Mobile App Setup

### 1. Install Dependencies

```bash
cd student-task-app/mobile
npm install
```

### 2. Configure API URL

Edit `mobile/src/constants/index.js` and update the `BASE_URL`:

```javascript
// For Android Emulator
BASE_URL: 'http://10.0.2.2:5000/api',

// For iOS Simulator
BASE_URL: 'http://localhost:5000/api',

// For Physical Device (use your computer's IP)
BASE_URL: 'http://192.168.1.xxx:5000/api',

// For Production (Render)
BASE_URL: 'https://your-app-name.onrender.com/api',
```

### 3. Run the App

```bash
# Start Expo development server
npm start

# Or run directly on Android
npm run android

# Or run directly on iOS
npm run ios

# Or run in web browser
npm run web
```

### 4. Using Expo Go (Physical Device)

1. Install **Expo Go** from Play Store or App Store
2. Run `npm start`
3. Scan the QR code with your phone camera

---

## ⚙️ Backend Setup

### 1. Install Dependencies

```bash
cd student-task-app/backend
npm install
```

### 2. Create Environment File

Create `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/student-tasks?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d
```

### 3. Get MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `<username>` and `<password>` with your credentials

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

---

## 🌐 Deploy Backend to Render

### 1. Create Render Account

Go to [Render](https://render.com) and sign up

### 2. Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: student-task-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 3. Add Environment Variables

Add the same variables from your `.env` file in Render's dashboard

### 4. Deploy

Click "Create Web Service" and wait for deployment

### 5. Update Mobile App

Update `BASE_URL` in `mobile/src/constants/index.js` to your Render URL

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/today` | Get today's tasks |
| GET | `/api/tasks/week` | Get weekly tasks |
| GET | `/api/tasks/stats` | Get task statistics |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/status` | Update status |
| DELETE | `/api/tasks/:id` | Delete task |

---

## 🎨 App Features

### ✅ Implemented

- 🔐 User Registration & Login (JWT Auth)
- 📋 Create, Edit, Delete Tasks
- 📅 Daily & Weekly Schedule Views
- 🔔 Local Notifications & Reminders
- 📊 Task Statistics Dashboard
- 🏷️ Categories & Priorities
- 🔍 Filter Tasks by Status
- 📱 Beautiful UI with Dark/Light Support

### 🎯 Task Properties

- Title & Description
- Category (Study, Assignment, Exam, Project, Meeting, Other)
- Priority (Low, Medium, High)
- Status (Pending, In-Progress, Completed, Cancelled)
- Due Date & Time
- Reminder (customizable)
- Tags

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile Framework | Expo (React Native) |
| Navigation | React Navigation 6 |
| State Management | React Context + Hooks |
| HTTP Client | Axios |
| Local Storage | AsyncStorage |
| Notifications | Expo Notifications |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Authentication | JWT |
| Deployment | Render |

---

## 📂 Project Structure Details

### Backend Models

**User Model:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date
}
```

**Task Model:**
```javascript
{
  user: ObjectId (ref: User),
  title: String,
  description: String,
  category: Enum ['study', 'assignment', 'exam', 'project', 'meeting', 'other'],
  priority: Enum ['low', 'medium', 'high'],
  status: Enum ['pending', 'in-progress', 'completed', 'cancelled'],
  dueDate: Date,
  dueTime: String,
  reminderMinutes: Number,
  isRecurring: Boolean,
  recurringPattern: String,
  tags: [String],
  completedAt: Date
}
```

---

## 🧪 Testing the API

Use Postman, Thunder Client, or curl to test:

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Can't connect to backend from emulator:**
- Use `10.0.2.2` instead of `localhost` for Android
- Check if backend is running

**2. MongoDB connection error:**
- Verify your MongoDB Atlas credentials
- Whitelist your IP in Atlas
- Check if password has special characters (URL encode them)

**3. Notifications not working:**
- Grant notification permissions in app settings
- Check device battery optimization settings

**4. Build errors:**
- Delete `node_modules` and run `npm install` again
- Clear Metro bundler cache: `npm start -- --clear`

---

## 📝 License

MIT License - feel free to use this project for learning or building your own app!

---

## 👨‍💻 Author

Built with ❤️ for students to manage their academic tasks efficiently.
