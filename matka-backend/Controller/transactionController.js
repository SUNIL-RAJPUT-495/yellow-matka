import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { getTransactionSettings } from "../utils/transactionSettingsHelper.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// Helper to get clean URL
const getCleanUrl = (base, path) => {
    if (!base) return "";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.userId;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid amount is required."
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const transactionId = "TXN" + Date.now() + Math.floor(Math.random() * 1000);

        const transaction = await Transaction.create({
            userId: user._id,
            type: 'Deposit',
            amount: Number(amount),
            method: 'IMB',
            transactionId: transactionId,
            status: 'Pending'
        });

        const redirectUrl = process.env.FRONTEND_URL 
            ? `${process.env.FRONTEND_URL}/add-funds` 
            : `http://localhost:5173/add-funds`;

        const payload = new URLSearchParams({
            customer_mobile: String(user.mobile).replace(/\D/g, ""),
            user_token: process.env.IMB_CLIENT_SECRET,
            amount: String(amount),
            order_id: transactionId,
            customer_name: user.name,
            remark1: user.email || 'N/A',
            remark2: 'Deposit',
            redirect_url: redirectUrl,
        });


        const IMB_CREATE_ORDER_URL = getCleanUrl(process.env.IMB_BASE_URL, "/api/create-order");
        
        if (!IMB_CREATE_ORDER_URL || IMB_CREATE_ORDER_URL.startsWith("/api")) {
             throw new Error("IMB_BASE_URL is not configured in environment variables.");
        }

        const response = await axios.post(IMB_CREATE_ORDER_URL, payload.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const data = response.data;
        console.log("IMB Final Response:", data);

        if (data && data.status === true && data.result) {
            return res.status(200).json({
                success: true,
                message: "Order Created Successfully",
                payment_url: data.result.payment_url || data.result.paytm_link || data.result.bhim_link || data.result.check_link,
                orderId: transactionId
            });
        } else {
            throw new Error(data.message || "Failed to generate payment link.");
        }

    } catch (error) {
        console.error("IMB Create Order Error:", error.response?.data || error.message);
        
        const errorDetail = error.response?.data?.message || error.response?.data || error.message;
        
        res.status(500).json({ 
            success: false, 
            message: "Payment initialization failed.",
            error: errorDetail
        });
    }
};

// ==========================================
// 2. VERIFY PAYMENT 
// ==========================================
export const verifyPayment = async (req, res) => {
    try {
        const { transactionId } = req.body;

        if (!transactionId) {
            return res.status(400).json({ success: false, message: "Transaction ID missing" });
        }

        const transaction = await Transaction.findOne({ transactionId });
        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        const statusPayload = {
            user_token: process.env.IMB_CLIENT_SECRET,
            order_id: transactionId
        };

        let IMB_STATUS_URL = process.env.IMB_STATUS_URL;
        if (!IMB_STATUS_URL && process.env.IMB_BASE_URL) {
            IMB_STATUS_URL = getCleanUrl(process.env.IMB_BASE_URL, "/api/check-order-status");
        }

        if (!IMB_STATUS_URL) {
            throw new Error("IMB_STATUS_URL is not configured.");
        }

        const response = await axios.post(IMB_STATUS_URL, statusPayload);
        const data = response.data;

        if (data.status === "SUCCESS" || data.status === "COMPLETED") {
            if (transaction.status !== "Approved") {
                transaction.accountDetails = data.upi_txn_id || data.bank_txn_id || transactionId;
                transaction.status = "Approved";
                await transaction.save();

                const user = await User.findById(transaction.userId);
                if (user) {
                    if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
                    user.wallet.realBalance += transaction.amount;
                    await user.save();
                }

                return res.status(200).json({
                    success: true,
                    message: "Payment Verified Successfully"
                });
            } else {
                return res.status(200).json({ success: true, message: "Already verified" });
            }
        } else if (data.status === "PENDING" || data.status === "PROCESSING") {
            return res.status(200).json({
                success: true,
                message: "Payment is currently pending/processing. Please check back shortly.",
                status: "Pending"
            });
        } else {
            if (transaction.status !== "Rejected") {
                transaction.status = "Rejected";
                await transaction.save();
            }
            return res.status(400).json({ success: false, message: "Payment was not successful or failed." });
        }

    } catch (error) {
        console.error("Verify Error:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Internal Server Error during verification" });
    }
};

// ==========================================
// 3. IMB WEBHOOK 
// ==========================================
export const imbWebhook = async (req, res) => {
    try {
        const data = req.body;
        console.log("🔥 Webhook Received from IMB:", data);

        const transactionId = data.client_txn_id || data.order_id;

        if (!transactionId) {
            return res.status(400).send("Transaction ID missing");
        }

        const transaction = await Transaction.findOne({ transactionId });
        if (!transaction) {
            return res.status(404).send("Transaction not found");
        }


        if ((data.status === "SUCCESS" || data.status === "COMPLETED") && transaction.status !== "Approved") {
            transaction.accountDetails = data.upi_txn_id || data.bank_txn_id || transactionId;
            transaction.status = "Approved";
            await transaction.save();

            const user = await User.findById(transaction.userId);
            if (user) {
                if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
                user.wallet.realBalance += transaction.amount;
                await user.save();
            }
            console.log(`✅ Transaction ${transactionId} marked as APPROVED via Webhook!`);
        }
        else if (data.status === "FAILED" && transaction.status !== "Approved") {
            transaction.status = "Rejected";
            await transaction.save();
            console.log(`❌ Transaction ${transactionId} marked as REJECTED via Webhook!`);
        }

        return res.status(200).send("Webhook Received Successfully");

    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).send("Webhook processing failed");
    }
};
export const createDepositRequest = async (req, res) => {
    try {
        const userId = req.userId; 
        
        const { amount, method, transactionId, accountDetails } = req.body;

        if (!amount || !method || !transactionId || !accountDetails) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const depositAmount = Number(amount);
        if (depositAmount <= 0) {
            return res.status(400).json({ message: 'Invalid deposit amount' });
        }

        const settings = await getTransactionSettings();
        const minDeposit = Math.max(0, Number(settings.minDeposit) || 0);
        if (minDeposit > 0 && depositAmount < minDeposit) {
            return res.status(400).json({
                message: `Minimum deposit amount is ₹${minDeposit}`,
                minDeposit,
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingTransaction = await Transaction.findOne({ transactionId });
        if (existingTransaction) {
            return res.status(400).json({ message: 'This Transaction ID is already submitted!' });
        }

        const transaction = await Transaction.create({ 
            userId: userId,             
            type: 'Deposit',            
            amount: depositAmount, 
            method: method, 
            transactionId: transactionId, 
            accountDetails: accountDetails, 
            status: 'Pending'           
        });

        res.status(201).json({ 
            success: true,
            message: 'Deposit request created successfully', 
            transaction 
        });

    } catch (error) {
        console.error("Deposit Controller Error:", error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error', 
            error: error.message 
        });
    }
}

export const updateTransactionStatus = async (req, res) => {
    try {
        const { transactionId, status } = req.body;
        if (!transactionId || !status) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if(!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(400).json({ message: 'Transaction not found' });
        }
        if (transaction.status === 'Pending') {
            return res.status(400).json({ message: 'Transaction is already pending' });
        }
        if (transaction.status === 'Approved') {
            const user = await User.findById(transaction.userId);
            if (!user) {
                return res.status(400).json({ message: 'User associated with this transaction not found!' });
            }
            if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
            user.wallet.realBalance += transaction.amount;
            await user.save();
            return res.status(400).json({ message: 'Transaction already approved' });
        }
        transaction.status = status;
        await transaction.save();
        return res.status(200).json({ message: `Deposit ${status.toLowerCase()} successfully!`, transaction });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const getAllPendingDeposits = async (req, res) => {
    try {
        const pendingDeposits = await Transaction.find({ type: 'Deposit', status: 'Pending' }).populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ pendingDeposits });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const allTransaction = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ transactions });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}   


export const createWithdrawalRequest = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId; 
        const { amount, method, transactionId, accountDetails } = req.body;
        if (!userId || !amount || !method || !transactionId || !accountDetails) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const withdrawAmount = Number(amount);
        if (withdrawAmount <= 0) {
            return res.status(400).json({ message: 'Invalid withdrawal amount' });
        }

        const settings = await getTransactionSettings();
        const minWithdrawal = Math.max(0, Number(settings.minWithdrawal) || 0);
        if (minWithdrawal > 0 && withdrawAmount < minWithdrawal) {
            return res.status(400).json({
                message: `Minimum withdrawal amount is ₹${minWithdrawal}`,
                minWithdrawal,
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
        const currentBalance = user.wallet.realBalance || 0;

        if (currentBalance < withdrawAmount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        user.wallet.realBalance -= withdrawAmount;
        await user.save();

        const transaction = await Transaction.create({
            userId,
            type: 'Withdrawal',
            amount: withdrawAmount,
            method,
            transactionId,
            accountDetails,
            status: 'Pending',
        });
        res.status(201).json({ message: 'Withdrawal request submitted successfully!', transaction });
       
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const updateWithdrowalStatus =async(req,res)=>{
    try {
        const { transactionId, status } = req.body; 
    
        if (!['Approved', 'Rejected'].includes(status)) {
          return res.status(400).json({ message: "Invalid status!" });
        }
    
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: "Transaction not found!" });
    
        if (transaction.status !== 'Pending') {
          return res.status(400).json({ message: `This transaction is already ${transaction.status}.` });
        }
    
        const user = await User.findById(transaction.userId);
        if (!user) return res.status(404).json({ message: "User not found!" });
    
        // --- LOGIC FOR DEPOSIT ---
        if (transaction.type === 'Deposit') {
          if (status === 'Approved') {
            if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
            user.wallet.realBalance += transaction.amount; 
          }
        } 
        else if (transaction.type === 'Withdrawal') {
          if (status === 'Rejected') {
            if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
            user.wallet.realBalance += transaction.amount; 
          }
        }
    
        await user.save(); 
    
        transaction.status = status;
        await transaction.save(); 
    
        res.status(200).json({ 
          message: `${transaction.type} ${status.toLowerCase()} successfully!`, 
          transaction 
        });
    
      } catch (error) {
        console.error("Update Transaction Error:", error);
        res.status(500).json({ message: "Server error while updating transaction." });
      }
}

export const getAllPendingWithdrawals = async (req, res) => {
    try {
      const pendingWithdrawals = await Transaction.find({ type: 'Withdrawal', status: 'Pending' })
        .populate('userId', 'name mobile')
        .sort({ createdAt: -1 });
  
      res.status(200).json(pendingWithdrawals);
    } catch (error) {
      console.error("Get Pending Withdrawals Error:", error);
      res.status(500).json({ message: "Server error while fetching requests." });
    }
  };


  export const getAllWithdrawals = async (req, res) => {
    try {
      const withdrawals = await Transaction.find({ type: 'Withdrawal' })
        .populate('userId', 'name mobile')
        .sort({ createdAt: -1 });
  
      res.status(200).json(withdrawals);
    } catch (error) {
      console.error("Get Withdrawals Error:", error);
      res.status(500).json({ message: "Server error while fetching requests." });
    }
  };

export const adminAddFund = async (req, res) => {
    try {
        const { userId, amount, remark } = req.body;
        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid user ID and amount are required' });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
        user.wallet.realBalance += Number(amount);
        await user.save();

        const transaction = await Transaction.create({
            userId,
            type: 'Deposit',
            amount: Number(amount),
            method: 'Admin',
            transactionId: 'ADM-' + Date.now(),
            accountDetails: remark || 'Added by Admin',
            status: 'Approved'
        });

        res.status(200).json({ success: true, message: `Successfully added ₹${amount} to user's wallet`, transaction, newBalance: user.wallet.realBalance });
    } catch (error) {
        console.error("Admin Add Fund Error:", error);
        res.status(500).json({ success: false, message: 'Server error while adding funds', error: error.message });
    }
};

export const adminDeductFund = async (req, res) => {
    try {
        const { userId, amount, remark } = req.body;
        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid user ID and amount are required' });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        if (!user.wallet) user.wallet = { realBalance: 0, bonusBalance: 0 };
        if (user.wallet.realBalance < Number(amount)) {
            return res.status(400).json({ success: false, message: `Insufficient balance. User only has ₹${user.wallet.realBalance}` });
        }

        user.wallet.realBalance -= Number(amount);
        await user.save();

        const transaction = await Transaction.create({
            userId,
            type: 'Withdrawal',
            amount: Number(amount),
            method: 'Admin',
            transactionId: 'ADM-' + Date.now(),
            accountDetails: remark || 'Deducted by Admin',
            status: 'Approved'
        });

        res.status(200).json({ success: true, message: `Successfully deducted ₹${amount} from user's wallet`, transaction, newBalance: user.wallet.realBalance });
    } catch (error) {
        console.error("Admin Deduct Fund Error:", error);
        res.status(500).json({ success: false, message: 'Server error while deducting funds', error: error.message });
    }
};