📝 NotesFlow

A full-stack Notes Management Application built using Node.js (Express) and React.js (with Tailwind CSS).
It provides a powerful and scalable platform to create, organize, and interact with notes — enhanced with AI capabilities and modern UI features.

---

🚀 Live Features

🔐 Authentication & Security

- User Registration & Login
- JWT-based Authentication
- Protected & Public Routes
- Forgot Password & Reset Password
- Secure middleware-based route protection

---

🗂️ Notes & Folder Management

- Create, Read, Update, Delete (CRUD) Notes
- Folder-based organization system
- Add notes inside folders
- Shareable notes via link
- Attach images and files to notes

---

🤖 AI Integration

- Ask questions related to your notes
- General-purpose AI assistant
- Smart responses using AI service
- Integrated AI chat panel

---

🎨 UI/UX & Frontend

- Built with React + Tailwind CSS
- Fully Responsive Design (Mobile + Desktop)
- Skeleton loading & smooth UI experience
- Custom components & reusable structure
- 404 Page Not Found handling

---

🧠 Advanced Features

- Canvas support for interactive usage
- Sidebar AI Agent interface
- Clean and modular frontend architecture
- Optimized state handling

---

🏗️ Project Structure

NotesFlow/
│
├── BackEnd/
│   ├── config/
│   │   ├── cloudinary.config.js
│   │   └── db.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── chat.model.js
│   │   ├── notes.model.js
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   ├── chat.route.js
│   │   ├── notes.route.js
│   │   └── user.routes.js
│   │
│   ├── services/
│   │   └── ai.service.js
│   │
│   ├── app.js
│   ├── package.json
│   └── .env
│
├── FrontEnd/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AIAgentSidebar.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Notes.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PublicRoute.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── SharedNote.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   └── .env
│
└── README.md

---

⚙️ Tech Stack

Frontend

- React.js
- Tailwind CSS
- React Router

Backend

- Node.js
- Express.js
- MongoDB (Mongoose)

Other Tools

- Cloudinary (for file uploads)
- JWT (Authentication)
- AI Service Integration

---

🛠️ Installation & Setup

1️⃣ Clone Repository

git clone https://github.com/Prince671/NotesFlow.git
cd NotesFlow

---

2️⃣ Backend Setup

cd BackEnd
npm install

Create ".env" file:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_URL=your_cloudinary_url

Run backend:

npm start

---

3️⃣ Frontend Setup

cd FrontEnd
npm install
npm run dev

---

🔐 Environment Variables

Backend

- "MONGO_URI"
- "JWT_SECRET"
- "CLOUDINARY_URL"

Frontend

- API Base URL (if required)

---

📌 Key Highlights

- Clean and scalable folder structure
- Full authentication system
- AI-powered assistant inside app
- Folder-based note management
- File/image upload support
- Shareable notes
- Responsive modern UI

---

📸 Future Improvements

- Real-time collaboration
- Note version history
- Dark mode toggle
- Drag & drop folders/notes
- Voice-based AI interaction

---

👨‍💻 Author

Prince Soni
GitHub: https://github.com/Prince671/Notes_Flow

---

📄 License

This project is licensed under the MIT License.
