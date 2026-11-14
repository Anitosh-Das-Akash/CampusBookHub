# 📚 CampusBookHub

**A MERN Stack University Used Book Sharing Platform**

CampusBookHub is a web-based platform designed to help university students buy, sell, exchange, and share used academic books with other students.

The platform makes it easier for students to find affordable books and connect with other students within their university community.

## ✨ Features

- User Registration and Login
- Secure Authentication using JWT and HTTP-only Cookies
- User Profile Management
- Profile Picture Upload
- Add, Edit and Manage Books
- Browse and Search Books
- Filter Books by Department, Condition and Exchange Type
- Book Request Management
- Accept and Complete Book Exchanges
- Wishlist Management
- Notifications
- Book Reviews and Ratings
- Contact Sellers
- Responsive User Interface

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt.js
- Multer

### Cloud Services
- Cloudinary — Image Storage
- MongoDB Atlas — Cloud Database

## 📁 Project Structure

```text
CampusBookHub/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   ├── Context/
│   │   ├── Pages/
│   │   └── Services/
│   └── package.json
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Anitosh-Das-Akash/CampusBookHub.git

cd CampusBookHub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

## 🔐 Environment Variables

Keep all sensitive credentials in environment files.

**Never commit `.env` files or expose database passwords, JWT secrets, or Cloudinary API secrets publicly.**

## 👨‍💻 Developer

**Anitosh Das**

- GitHub: [Anitosh-Das-Akash](https://github.com/Anitosh-Das-Akash)

## 📄 License

This project is currently developed as a personal project.
