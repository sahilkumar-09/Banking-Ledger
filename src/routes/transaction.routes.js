import express from 'express'
import {
  authMiddleware,
  authSystemMiddleware,
} from "../middlewares/auth.middleware.js";
import { createInitialFundsTransaction, createTransaction } from '../controllers/transaction.controller.js'

const transactionRoutes = express.Router()

transactionRoutes.post("/", authMiddleware, createTransaction)

transactionRoutes.post("/system/initial-funds", authSystemMiddleware, createInitialFundsTransaction)

export default transactionRoutes