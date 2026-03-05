import express from 'express'
import {
  loginController,
  registerController,
  userLogoutController,
} from "../controllers/auth.controller.js";
const authRoutes = express.Router()

authRoutes.post('/register', registerController)

authRoutes.post('/login', loginController)

authRoutes.post('/logout', userLogoutController)
export default authRoutes