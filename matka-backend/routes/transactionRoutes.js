import express from 'express';
import { createDepositRequest, updateTransactionStatus, getAllPendingDeposits ,getAllPendingWithdrawals,updateWithdrowalStatus,allTransaction,createWithdrawalRequest, getAllWithdrawals, createOrder, verifyPayment, imbWebhook, adminAddFund, adminDeductFund } from '../Controller/transactionController.js';
import {authToken   } from '../middleware/authToken.js';
import {verifyAdminToken} from '../middleware/verifyAdminToken.js';
const transactionRouter = express.Router();

transactionRouter.post('/create-deposit-request',authToken, createDepositRequest);
transactionRouter.post('/create-order', authToken, createOrder);
transactionRouter.post('/verify-payment', verifyPayment);
transactionRouter.post('/imb-webhook', imbWebhook);
transactionRouter.put('/update-transaction-status', verifyAdminToken, updateTransactionStatus);
transactionRouter.post('/withdraw',authToken, createWithdrawalRequest);


// --- ADMIN ROUTES ---
transactionRouter.get('/pending-deposits', verifyAdminToken, getAllPendingDeposits);
transactionRouter.get('/pending-withdrawals', verifyAdminToken, getAllPendingWithdrawals);
transactionRouter.post('/update-status', verifyAdminToken, updateWithdrowalStatus);
transactionRouter.put('/update-withdrawal-status', verifyAdminToken, updateWithdrowalStatus);
transactionRouter.get('/all-withdrawals', verifyAdminToken, getAllWithdrawals);
transactionRouter.get('/all-transactions', verifyAdminToken, allTransaction);
transactionRouter.post('/admin/add-fund', verifyAdminToken, adminAddFund);
transactionRouter.post('/admin/deduct-fund', verifyAdminToken, adminDeductFund);


export default transactionRouter;