# 🏠 Divar API

A modern API for a residential and commercial property sharing platform (inspired by Divar)

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Development](#development)

## ✨ Features

- ✅ Authentication and User Management
- ✅ Category Management
- ✅ Post/Announcement Management
- ✅ Flexible Options System
- ✅ Swagger API Documentation
- ✅ MongoDB Database
- ✅ File and Image Upload
- ✅ Exception Handling

## 🔧 Requirements

- **Node.js** >= 14.x
- **npm** >= 6.x
- **MongoDB** >= 4.x
- **Git**

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/rjs-divar-api.git
cd rjs-divar-api
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file in the root of the project:

```env
# Server Config
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/divar

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Cookie
COOKIE_EXPIRE=7

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./public/upload
```

### 4️⃣ Start the Server

```bash
npm start
```

The server will start on port `3000`.

## 📁 Project Structure

```
src/
├── modules/              # Core modules
│   ├── auth/            # Authentication
│   ├── user/            # User Management
│   ├── category/        # Categories
│   ├── post/            # Posts/Announcements
│   └── option/          # System Options
├── config/              # Configuration Files
├── common/              # Shared Code
│   ├── constant/        # Constants
│   ├── exception/       # Error Handling
│   ├── guard/           # Authorization Guards
│   ├── messages/        # System Messages
│   └── utils/           # Utility Functions
├── app.routes.js        # Main Routes Definition
└── ...

public/                  # Static Files
├── assets/              # CSS, JS, Images
├── html/                # HTML Pages
└── upload/              # Uploaded Files
```

## 🔌 API Endpoints

### 🔐 Authentication

- `POST /api/auth/login` - User Login
- `POST /api/auth/register` - User Registration
- `POST /api/auth/logout` - User Logout

### 👤 Users

- `GET /api/users` - Get All Users
- `GET /api/users/:id` - Get User Details
- `PUT /api/users/:id` - Update User
- `DELETE /api/users/:id` - Delete User

### 📂 Categories

- `GET /api/categories` - Get All Categories
- `POST /api/categories` - Create Category
- `PUT /api/categories/:id` - Update Category
- `DELETE /api/categories/:id` - Delete Category

### 📰 Posts

- `GET /api/posts` - Get All Posts
- `POST /api/posts` - Create Post
- `GET /api/posts/:id` - Get Post Details
- `PUT /api/posts/:id` - Update Post
- `DELETE /api/posts/:id` - Delete Post

### ⚙️ Options

- `GET /api/options` - Get All Options
- `POST /api/options` - Create Option
- `PUT /api/options/:id` - Update Option
- `DELETE /api/options/:id` - Delete Option

## 🔐 Environment Variables

| Variable        | Description         | Example                         |
| --------------- | ------------------- | ------------------------------- |
| `PORT`          | Server Port         | 3000                            |
| `NODE_ENV`      | Environment Mode    | development/production          |
| `MONGO_URI`     | MongoDB Connection  | mongodb://localhost:27017/divar |
| `JWT_SECRET`    | JWT Secret Key      | your-secret-key                 |
| `JWT_EXPIRE`    | JWT Expiration Time | 7d                              |
| `COOKIE_EXPIRE` | Cookie Expiration   | 7                               |

## 🧪 Development

### Running Server in Watch Mode

```bash
npm start
```

The server will automatically restart when files are modified (using nodemon).

### View Swagger Documentation

After starting the server, visit:

```
http://localhost:3000/api-docs
```

## 📜 License

This project is licensed under the ISC License.

## 👨‍💻 Developers

- Developer Information

## 📞 Contact & Support

For questions and bug reports, please open an Issue.
