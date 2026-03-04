import transactions from "../models/transaction.model.js";
import ledgers from "../models/ledger.model.js";
import accounts from '../models/account.model.js'
import {
  sendTransactionEmail,
  sendTransactionFailureEmail,
  sendRegistrationEmail,
} from "../services/email.service.js";

const createTransaction = async () => {
  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message:
          "fromAccount, toAccount, amount and idempotencyKey are required",
      });
    }

    // 1. Validate request  

    const fromUserAccount = await accounts.findOne({
      _id: fromAccount,
    });

    const toUserAccount = await accounts.findOne({
      _id: toAccount,
    });

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        success: false,
        message: "fromUserAccount and toUserAccount are invalid",
      });
    }

    // 2. Validate idempotency key

    const isTransactionExist = await transactions.findOne({
      idempotencyKey: idempotencyKey,
    });

    if (isTransactionExist) {
      if (isTransactionExist.status === "COMPLETED") {
        return res.status(200).json({
          success: true,
          message: "Transaction already processed",
          transaction: isTransactionExist,
        });
      }
      if (isTransactionExist.status === "PENDING") {
        return res.status(200).json({
          success: true,
          message: "Transaction is still processing",
        });
      }
      if (isTransactionExist.status === "FAILED") {
        return res.status(500).json({
          success: false,
          message: "Transaction processing failed previously, please retry",
        });
      }
      if (isTransactionExist.status === "REVERSED") {
        res.status(500).json({
          success: false,
          message: "Transaction was reversed, please retry",
        });
      }
    } 
    
    //  3. Check account status

    if (
      fromUserAccount.status !== "ACTIVE" ||
      toUserAccount.status !== "ACTIVE"
    ) {
      return res.status(400).json({
        success: false,
        message: "Both accounts must be active to perform a transaction",
      });
    }

    // 4. Derive sender balance from ledger

    const balance = await fromUserAccount.getBalance()
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
    createTransaction
}