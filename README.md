# BookNook - Backend API

<p align="center">
  <strong>RESTful API for the BookNook Online Library Management Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Authentication-Better%20Auth-000000" alt="Better Auth" />
  <img src="https://img.shields.io/badge/Deployment-Render-46E3B7?logo=render&logoColor=black" alt="Render" />
</p>

---

## Live API

| Resource             | URL                                             |
| -------------------- | ----------------------------------------------- |
| Backend API          | https://booknook-server-sudl.onrender.com       |
| Books Endpoint       | https://booknook-server-sudl.onrender.com/books |
| Frontend Application | https://yourbook-nook.vercel.app/               |

> **Note:** The API root does not serve a homepage. Use the documented API endpoints to access backend resources.

## Overview

BookNook Backend is the REST API powering the BookNook online library management application.

Built with **Node.js, Express.js, TypeScript, and MongoDB**, it handles book management, borrowing and returning operations, user-specific records, and secure communication with the Next.js frontend.

The API uses Better Auth JWT verification to protect private operations and MongoDB transactions to maintain accurate book inventory during borrowing and returning.

## Key Features

- **Book Management:** Create, retrieve, update, and delete book records.
- **Book Discovery:** Retrieve books with search and category filtering.
- **Secure Authentication:** Verify Better Auth JWT tokens before processing protected requests.
- **Borrowing System:** Allow authenticated users to borrow available books.
- **Return Management:** Process book returns and restore available inventory.
- **Inventory Management:** Track total copies and available copies.
- **Duplicate Borrow Prevention:** Prevent a user from borrowing the same book more than once while an active borrow exists.
- **Atomic Updates:** Use MongoDB `$inc` operations to maintain inventory consistency.
- **Database Transactions:** Use transactions for borrowing and returning operations.
- **Ownership Protection:** Restrict book modifications to the user who added the book.
- **CORS Configuration:** Allow requests from the configured frontend origin.
- **Input Validation:** Validate incoming request parameters and payloads.

## Technology Stack

| Technology            | Purpose                         |
| --------------------- | ------------------------------- |
| Node.js               | JavaScript runtime              |
| Express.js            | REST API framework              |
| TypeScript            | Type-safe development           |
| MongoDB               | NoSQL database                  |
| MongoDB Native Driver | Database operations             |
| Better Auth           | Authentication and JWT identity |
| Zod                   | Request validation              |
| pnpm                  | Package management              |
| Render                | Backend deployment              |

## API Endpoints

The backend implements exactly **eight REST API route patterns**.

### Books

| Method | Endpoint     | Description                                              | Access  |
| ------ | ------------ | -------------------------------------------------------- | ------- |
| GET    | `/books`     | Retrieve books with optional search and category filters | Public  |
| GET    | `/books/:id` | Retrieve a single book by ID                             | Public  |
| POST   | `/books`     | Add a new book                                           | Private |
| PATCH  | `/books/:id` | Update an existing book                                  | Private |
| DELETE | `/books/:id` | Delete a book                                            | Private |

### Borrowing

| Method | Endpoint       | Description                | Access  |
| ------ | -------------- | -------------------------- | ------- |
| POST   | `/borrows`     | Borrow an available book   | Private |
| GET    | `/borrows`     | Retrieve borrowing records | Private |
| DELETE | `/borrows/:id` | Return a borrowed book     | Private |

### API Query Parameters

The `GET /books` endpoint supports:

| Parameter  | Description                                    |
| ---------- | ---------------------------------------------- |
| `search`   | Search books by supported text fields          |
| `category` | Filter books by category                       |
| `mine`     | Retrieve books added by the authenticated user |
| `limit`    | Limit the number of returned records           |
| `sort`     | Sort books using the supported `newest` option |

Example:

```http
GET /books?category=Fiction&search=Harry%20Potter
```

Example response structure:

```json
{
    "success": true,
    "data": []
}
```

## Authentication & Authorization

BookNook uses **Better Auth** on the frontend for user authentication and Google OAuth.

The backend independently verifies JWT access tokens before allowing protected operations.

Authentication workflow:

1. A user signs in through Google OAuth.
2. Better Auth manages the authenticated session.
3. The frontend sends the authentication token with protected API requests.
4. Express middleware verifies the JWT signature and its required claims using Better Auth's JWKS configuration.
5. The verified user identity is attached to the request.
6. Controllers and services use the verified identity for authorization and data access.

Protected API requests must include the appropriate authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

The backend does not trust user identity supplied directly in request bodies.

## Database Design

BookNook uses MongoDB to store book records and active borrowing records.

### Books Collection

| Field             | Description                       |
| ----------------- | --------------------------------- |
| `_id`             | Unique book identifier            |
| `title`           | Book title                        |
| `author`          | Author name                       |
| `category`        | Book category                     |
| `description`     | Book description                  |
| `coverImage`      | Book cover image URL              |
| `totalCopies`     | Total number of copies            |
| `availableCopies` | Currently available copies        |
| `addedByUserId`   | ID of the user who added the book |

### Borrows Collection

Borrowing records maintain the relationship between users and books.

| Field        | Description                        |
| ------------ | ---------------------------------- |
| `_id`        | Unique borrowing record identifier |
| `bookId`     | Reference to the borrowed book     |
| `userId`     | ID of the borrowing user           |
| `borrowedAt` | Borrowing date                     |
| `dueDate`    | Expected return date               |

_Field descriptions are conceptual; refer to the implementation for exact schema and optional fields._

## Borrowing & Inventory Logic

Inventory consistency is an important part of the application.

When a user borrows a book:

1. The backend verifies the authenticated user.
2. It checks whether the requested book exists.
3. It checks whether copies are available.
4. It prevents duplicate active borrowing by the same user.
5. A MongoDB transaction creates the borrowing record and decreases available inventory.
6. The transaction commits only when the operations succeed.

When a user returns a book:

1. The backend validates the borrowing record.
2. It processes the return within a MongoDB transaction.
3. It removes the active borrowing record.
4. It restores the available copy count.

MongoDB's `$inc` operator is used for inventory updates, while transactions help keep related database operations consistent.

**Additional safeguards:**

- A book cannot be borrowed when no copies are available.
- A user cannot create duplicate active borrowing records for the same book.
- A book with active loans cannot be deleted.
- Only the original book owner can modify or delete that book.

## Project Structure

The backend follows a modular architecture that separates configuration, routing, controllers, services, and validation.

```text
server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── server.ts
│   └── ...
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

> The structure above is a simplified overview. Refer to the repository for the complete source tree.

## Getting Started

Follow these steps to run the backend locally.

### Prerequisites

Make sure you have installed:

- Node.js 20.9 or later
- pnpm
- MongoDB Atlas account or a compatible MongoDB replica-set deployment
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/sasamir10/booknook-server
```

Navigate into the project directory:

```bash
cd booknook-server
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the server root directory.

Use the following example:

```env
NODE_ENV=development
PORT=4000

MONGODB_URI=your_mongodb_connection_string
DB_NAME=booknook

BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000

BORROW_DURATION_DAYS=7
```

**Environment variable descriptions:**

| Variable               | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `NODE_ENV`             | Application environment                                   |
| `PORT`                 | Local server port; production hosting may provide its own |
| `MONGODB_URI`          | MongoDB connection string                                 |
| `DB_NAME`              | MongoDB database name                                     |
| `BETTER_AUTH_URL`      | Frontend Better Auth origin used for JWT verification     |
| `CLIENT_URL`           | Allowed frontend origin for CORS                          |
| `BORROW_DURATION_DAYS` | Borrowing period in days                                  |

> Never commit your `.env` file or expose database credentials. Use `.env.example` as a reference and configure production variables through your hosting provider.

**Important:** MongoDB transactions require a replica-set or sharded MongoDB deployment. A standalone MongoDB server is not sufficient.

### 4. Run the Development Server

```bash
pnpm dev
```

The API will be available at:

```text
http://localhost:4000
```

### 5. Build for Production

```bash
pnpm build
```

### 6. Start the Production Server

```bash
pnpm start
```

## Deployment

The BookNook backend is deployed using **Render**.

Production configuration requires:

- `NODE_ENV=production`
- `MONGODB_URI`
- `DB_NAME`
- `BETTER_AUTH_URL`
- `CLIENT_URL`
- `BORROW_DURATION_DAYS` (optional; defaults to the configured application value)

The production `BETTER_AUTH_URL` and `CLIENT_URL` must match the deployed frontend origin:

```text
https://yourbook-nook.vercel.app
```

The production MongoDB connection must use a deployment that supports transactions, and its network access rules must permit the backend to connect.

## Security Considerations

- JWT verification is performed on the backend.
- User identity is derived from verified authentication claims.
- Private routes require authentication.
- Request data is validated before database operations.
- Book ownership is checked before modifications.
- Duplicate active borrowing is prevented through a unique database index.
- MongoDB credentials and other secrets remain in environment variables.
- Production CORS is restricted to the configured frontend origin.
- Production configuration validates required environment variables before the server starts.

## Related Repository

**Frontend:** [BookNook Client](https://github.com/sasamir10/booknook-client)

**Live Application:** [https://yourbook-nook.vercel.app/](https://yourbook-nook.vercel.app/)

## Author

**GitHub:** [@sasamir10](https://github.com/sasamir10)

---

<p align="center">
  Built as part of the BookNook Online Library Management Platform.
</p>
