# BookNook API

Express and MongoDB API for the BookNook online library. Production must use MongoDB Atlas or another replica-set deployment because borrowing, returning, and inventory-sensitive updates use transactions.

## API routes

- `GET /books` — public listing. Supports `?limit=6&sort=newest`; `?mine=true` requires a valid JWT and returns the current user's books.
- `GET /books/:id` — authenticated book details.
- `POST /books` — authenticated create.
- `PATCH /books/:id` — authenticated owner update.
- `DELETE /books/:id` — authenticated owner delete; refuses books with active loans.
- `POST /borrows` — authenticated transactional borrow.
- `GET /borrows` — authenticated user's active loans.
- `DELETE /borrows/:id` — authenticated transactional return.

## Environment and local development

Copy `.env.example` to `.env`, set `MONGODB_URI`, and set `BETTER_AUTH_URL` to the client origin. Use a replica-set MongoDB for transactions. Run `pnpm install`, `pnpm dev`, and start the client separately.

For production, set `CLIENT_URL` to the exact Vercel origin and `BETTER_AUTH_URL` to the client’s Better Auth origin. Add the Render service’s origin to the Atlas network access list, and use a transaction-capable Atlas deployment.

The client Better Auth JWT plugin publishes a JWKS at its configured auth endpoint. Express verifies token signatures and claims against that key set. Production CORS should allow only the deployed client origin.
