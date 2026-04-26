```
# 📝 NotesFlow

A full-stack **Notes Management Application** built with **Node.js (Express)** for the backend and **React.js** for the frontend.  
This app allows users to create, manage, and organize their notes efficiently with authentication and protected routes.

---

## 🚀 Features
- User Authentication (Sign Up / Login / Logout)
- Protected Routes (Only accessible when logged in)
- Create, Read, Update, Delete (CRUD) Notes
- Organized folder structure for scalability
- Responsive frontend built with React
- Secure backend with Express and middleware

---

## 🏗️ Project Structure

```
````
NOTESMANAGER
│
├── BackEnd/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── node_modules/
│   ├── routes/
│   ├── .env
│   ├── .gitignore
│   ├── app.js
│   ├── package-lock.json
│   └── package.json
│
├── FrontEnd/
│   ├── dist/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   └── components/
│   │       ├── Login_SingUp.css
│   │       ├── Login.css
│   │       ├── Login.jsx
│   │       ├── Notes.css
│   │       ├── Notes.jsx
│   │       ├── NotFound.css
│   │       ├── NotFound.jsx
│   │       ├── ProtectedRoute.jsx
│   │       └── ...
│   ├── package.json
│   └── ...
│
└── README.md
````
````

---

## ⚙️ Tech Stack
### Backend
- Node.js
- Express.js
- MongoDB (via Mongoose)
- JWT Authentication
- Middleware for protection

### Frontend
- React.js
- React Router DOM
- CSS for styling

---

## 📦 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/NotesManager.git
cd NotesManager
````

### 2️⃣ Backend Setup

```bash
cd BackEnd
npm install
```

Create a `.env` file inside `BackEnd/`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend server:

```bash
npm start
```

### 3️⃣ Frontend Setup

```bash
cd FrontEnd
npm install
```

Run frontend React app:

```bash
npm run dev
```

---

## 🚦 Running the App

* Backend → `http://localhost:3000`
* Frontend → `http://localhost:5173`

---

## 📸 Screenshots

<img width="787" height="645" alt="image" src="https://github.com/user-attachments/assets/871625b4-d6ce-42b9-af61-9d04f746bf01" />
<img width="787" height="646" alt="image" src="https://github.com/user-attachments/assets/da983ace-fa4d-4ad5-91c5-70504097dffa" />



---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

---
