import express from 'express'
import authRoutes from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from './routes/transaction.routes.js';

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use("/api/account", accountRoutes);
app.use('/api/transaction', transactionRoutes)

export default app