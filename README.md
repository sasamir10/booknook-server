# ⚙️ BookNook — Backend API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?logo=express" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployment-Render-46E3B7?logo=render" />
</p>

<p align="center">
  RESTful API powering the BookNook Online Library Management Platform.
</p>

<p align="center">
  <a href="https://booknook-server-sudl.onrender.com/books">
    <img src="https://img.shields.io/badge/Live_API-Visit_Backend-214D3D?style=for-the-badge&logo=express&logoColor=white" alt="Live Backend API" />
  </a>
  &nbsp;
  <a href="https://yourbook-nook.vercel.app/">
    <img src="https://img.shields.io/badge/Frontend-Visit_Website-214D3D?style=for-the-badge&logo=vercel&logoColor=white" alt="Frontend Website" />
  </a>
</p>

---

## 📖 Overview

BookNook Backend is a RESTful API developed to handle book management, borrowing, returning, and user-specific operations.

Built with Node.js, Express.js, TypeScript, and MongoDB, it provides secure API communication, reliable inventory management, and consistent database operations.

## ✨ Key Features

- 📚 **Book Management** — Create, retrieve, update, and delete books.
- 🔎 **Search & Filtering** — Search books and filter by category.
- 🔐 **JWT Authentication** — Verify Better Auth tokens for protected operations.
- 📖 **Borrowing System** — Borrow available books with inventory validation.
- ↩️ **Return Management** — Process returns and restore available copies.
- 🛡️ **Duplicate Prevention** — Prevent duplicate active borrowing.
- 🔄 **Database Transactions** — Maintain consistency during borrowing and returning.
- 👤 **Ownership Protection** — Restrict book management to its owner.
- ✅ **Request Validation** — Validate incoming data using Zod.

## 🛠️ Tech Stack

| Technology      | Purpose            |
| --------------- | ------------------ |
| Node.js         | Runtime            |
| Express.js      | REST API           |
| TypeScript      | Type safety        |
| MongoDB Atlas   | Database           |
| Better Auth JWT | Authentication     |
| Zod             | Request validation |
| pnpm            | Package management |
| Render          | Deployment         |

## 🔌 API Endpoints

The backend implements eight REST API route patterns.

| Method | Endpoint       | Description           | Access  |
| ------ | -------------- | --------------------- | ------- |
| GET    | `/books`       | Get all books         | Public  |
| GET    | `/books/:id`   | Get book details      | Public  |
| POST   | `/books`       | Add a book            | Private |
| PATCH  | `/books/:id`   | Update a book         | Private |
| DELETE | `/books/:id`   | Delete a book         | Private |
| POST   | `/borrows`     | Borrow a book         | Private |
| GET    | `/borrows`     | Get borrowing records | Private |
| DELETE | `/borrows/:id` | Return a book         | Private |

## 🚀 Getting Started

**Prerequisites:** Node.js 20.9+, pnpm, Git, and a MongoDB replica-set or sharded deployment.

```bash
# Clone the repository
git clone https://github.com/sasamir10/booknook-server.git

# Navigate to the project
cd booknook-server

# Install dependencies
pnpm install
```

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=booknook
BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
BORROW_DURATION_DAYS=7
```

Start the development server:

```bash
pnpm dev
```

The API will be available at:

```text
http://localhost:4000
```

Build and run for production:

```bash
pnpm build
pnpm start
```

> **Note:** MongoDB transactions require a replica-set or sharded deployment. Never commit your `.env` file or expose database credentials.

## 🔗 Related Links

- 🌐 [Live Application](https://yourbook-nook.vercel.app/)
- 💻 [Frontend Repository](https://github.com/sasamir10/booknook-client)
- 🔌 [Live Books API](https://booknook-server-sudl.onrender.com/books)

## 👨‍💻 Developer

**Samir** · [GitHub Profile](https://github.com/sasamir10)

---

<p align="center">
  ⚙️ <strong>BookNook Backend — Secure. Reliable. Efficient.</strong>
</p>
