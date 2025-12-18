Backend (Node.js + Express + MongoDB)
------------------------------------
Setup:
  1. Copy .env.example to .env and set MONGO_URI and JWT_SECRET
  2. npm install
  3. npm run dev (requires nodemon) or npm start
  4. Use Postman to call /api/auth/register and /api/auth/login then use token for /api/expenses
