import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import {
  createAccountController,
    getUserAccountsController,
  getBalanceController
} from "../controllers/account.controller.js";

const accountRoutes = express.Router()

accountRoutes.post("/", authMiddleware, createAccountController);
accountRoutes.get('/', authMiddleware, getUserAccountsController)
accountRoutes.get('/balance/:accountId',authMiddleware, getBalanceController)

export default accountRoutes;