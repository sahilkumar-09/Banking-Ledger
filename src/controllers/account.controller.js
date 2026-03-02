import accounts from "../models/account.model.js";

const createAccountController = async (req, res) => {
    try {
        const user = req.user
        const account = await accounts.create({
            user: user._id,
        })

        res.status(201).json({
            success: true,
            message: "Account created",
            account
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

export {
    createAccountController
}