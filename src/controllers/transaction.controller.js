import transactions from "../models/transaction.model.js";
import ledgers from "../models/ledger.model.js";
import accounts from "../models/account.model.js";
import {
  sendTransactionEmail,
  sendTransactionFailureEmail,
  sendRegistrationEmail,
} from "../services/email.service.js";
import mongoose from "mongoose";

const createTransaction = async (req, res) => {
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

    const balance = await fromUserAccount.getBalance();
    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Current balance is ${balance}. Requested balance is ${amount}`,
      });
    }

    // 5. Create transactions (PENDING)
    let transaction;
    
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      transaction = (
        await transactions.create(
          [
            {
              fromAccount,
              toAccount,
              amount: amount,
              idempotencyKey,
              status: "PENDING",
            },
          ],
          { session },
        )
      )[0];

      // 6. Create DEBIT ledger entry

      const debitLedger = await ledgers.create(
        [
          {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT",
          },
        ],
        { session },
      );

      (() => {
        return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
      })();

      // 7. Create CREDIT ledger entry

      const creditLedger = await ledgers.create(
        [
          {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT",
          },
        ],
        { session },
      );

      //  8. Mark transaction COMPLETED

      await transactions.findOneAndUpdate(
        { _id: transaction._id },
        { status: "COMPLETED" },
        { session },
      );

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          "Transaction is pending due to some issue, please retry after sometimes",
      });
    }
    // 9. Send email notification

    await sendTransactionEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount,
    );

    return res.status(201).json({
      success: true,
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createInitialFundsTransaction = async (req, res) => {
  try {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "toAccount, amount and idempotencyKey are required",
      });
    }

    const toUserAccount = await accounts.findOne({ account: toAccount._id });

    if (!toUserAccount) {
      return res.status(400).json({
        success: false,
        message: "Invalid toUserAccount",
      });
    }

    const fromUserAccount = await accounts.findOne({
      user: req.user._id,
    });

    if (!fromUserAccount) {
      return res.status(400).json({
        message: "System user account not found",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await transactions.create(
      [
        {
          fromAccount: fromUserAccount._id,
          toAccount,
          amount,
          idempotencyKey,
          status: "PENDING",
        },
      ],
      { session },
    );

    // DEBIT LEDGER

    await ledgers.create(
      [
        {
          account: fromUserAccount._id,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })();

    // CREDIT LEDGER

    await ledgers.create(
      [
        {
          account: toUserAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Initial funds transaction completed successfully",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { createTransaction, createInitialFundsTransaction };
