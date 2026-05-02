<div align="center">

# 📝 NotesFlow

**A full-stack Notes Management Application built with Node.js + React.js**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-Tailwind_CSS-61DAFB?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://mongodb.com)

*Create, organize, and interact with your notes — enhanced with AI capabilities and a modern UI.*

</div>

---

## 🚀 Live Features

### 🔐 Authentication & Security
- User Registration & Login
- JWT-based Authentication
- Protected & Public Routes
- Forgot Password & Reset Password flow
- Secure middleware-based route protection

### 🗂️ Notes & Folder Management
- Full **CRUD** operations on Notes
- Folder-based organization system
- Add notes inside folders
- Shareable notes via link
- Attach images and files to notes

### 🤖 AI Integration
- Ask questions related to your notes
- General-purpose AI assistant
- Smart responses using AI service
- Integrated AI chat panel inside the app

### 🎨 UI/UX & Frontend
- Built with **React + Tailwind CSS**
- Fully Responsive Design (Mobile + Desktop)
- Skeleton loading & smooth UI experience
- Custom reusable component architecture
- 404 Page Not Found handling

### 🧠 Advanced Features
- Canvas support for interactive usage
- Sidebar AI Agent interface
- Clean and modular frontend architecture
- Optimized state handling

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Tailwind CSS, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **File Uploads** | Cloudinary |
| **Auth** | JSON Web Tokens (JWT) |
| **AI** | AI Service Integration |

---

## 🏗️ Project Structure

```
NotesFlow/
│
├── BackEnd/
│   ├── config/
│   │   ├── cloudinary.config.js
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── chat.model.js
│   │   ├── notes.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── chat.route.js
│   │   ├── notes.route.js
│   │   └── user.routes.js
│   ├── services/
│   │   └── ai.service.js
│   ├── app.js
│   ├── package.json
│   └── .env
│
└── FrontEnd/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── AIAgentSidebar.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Notes.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── PublicRoute.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── SharedNote.jsx
    │   │   └── NotFound.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── .env
```

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Prince671/Notes_Flow.git
cd NotesFlow
```

### 2️⃣ Backend Setup

```bash
cd BackEnd
npm install
```

Create a `.env` file inside `BackEnd/`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_URL=your_cloudinary_url
```

Start the backend server:

```bash
npm start
```

### 3️⃣ Frontend Setup

```bash
cd FrontEnd
npm install
npm run dev
```

> The app will be running at `http://localhost:5173` by default.

---

## 🔐 Environment Variables

### Backend (`BackEnd/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_URL` | Cloudinary API URL for file uploads |

### Frontend (`FrontEnd/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE` | Base URL of your backend API |

---

## 📌 Key Highlights

- ✅ Clean and scalable folder structure
- ✅ Full authentication system (Register, Login, Forgot/Reset Password)
- ✅ AI-powered assistant inside the app
- ✅ Folder-based note management
- ✅ File & image upload support via Cloudinary
- ✅ Shareable notes via link
- ✅ Responsive, modern UI

---

## 📸 Future Improvements

- [ ] Real-time collaboration
- [ ] Note version history
- [ ] Dark mode toggle
- [ ] Drag & drop folders/notes
- [ ] Voice-based AI interaction

---

## 👨‍💻 Author

**Prince Soni**

[![GitHub](https://img.shields.io/badge/GitHub-Prince671-181717?logo=github)](https://github.com/Prince671/Notes_Flow)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
