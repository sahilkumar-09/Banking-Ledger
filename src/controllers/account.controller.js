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

const getUserAccountsController = async (req, res) => {
    try {
        const account = await accounts.find({ user: req.user._id })
        
        return res.status(200).json({
            success: "Account fetched",
            account
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error
        })
    }
}

const getBalanceController = async (req, res) => {
    try {
        const { accountId } = req.params;

        const account = await accounts.findOne({
            _id: accountId,
            user: req.user._id
        })

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }

        const balance = await account.getBalance()

        console.log(balance)
        res.status(200).json({
            accountId: account._id,
            balance
        })
    } catch (error) {
        console.log(error)
    }

}

export {
  createAccountController,
  getUserAccountsController,
  getBalanceController,
};