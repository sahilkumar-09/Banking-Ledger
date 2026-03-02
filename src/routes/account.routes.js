import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { createAccountController } from '../controllers/account.controller.js'

const accountRoutes = express.Router()

accountRoutes.post("/", authMiddleware, createAccountController);

export default accountRoutes;