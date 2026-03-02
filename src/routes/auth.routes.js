import express from 'express'
import { loginController, registerController } from "../controllers/auth.controller.js";
const authRoutes = express.Router()

authRoutes.post('/register', registerController)
authRoutes.get('/register', (req, res) => {
    res.send("registered successfully")
})
authRoutes.post('/login', loginController)

export default authRoutes