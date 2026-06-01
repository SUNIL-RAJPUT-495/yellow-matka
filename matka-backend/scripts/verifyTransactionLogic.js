import axios from 'axios';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { verifyPayment, updateWithdrowalStatus } from '../Controller/transactionController.js';

const original = {
    axiosPost: axios.post,
    findOne: Transaction.findOne,
    findById: Transaction.findById,
    userFindById: User.findById
};

const makeRes = () => {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
        send(payload) {
            this.body = payload;
            return this;
        }
    };
    return res;
};

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message);
    }
};

const run = async () => {
    const results = [];
    try {
        // 1) verifyPayment success should approve tx and credit wallet once
        {
            const tx = {
                status: 'Pending',
                amount: 100,
                userId: 'u1',
                save: async () => true
            };
            const user = {
                wallet: { realBalance: 50, bonusBalance: 0 },
                save: async () => true
            };
            Transaction.findOne = async ({ transactionId }) => (transactionId === 'TXN1' ? tx : null);
            User.findById = async (id) => (id === 'u1' ? user : null);
            axios.post = async () => ({ data: { status: 'SUCCESS', upi_txn_id: 'UPI123' } });

            const req = { body: { transactionId: 'TXN1' } };
            const res = makeRes();
            await verifyPayment(req, res);

            assert(res.statusCode === 200, 'verifyPayment success should return 200');
            assert(tx.status === 'Approved', 'Transaction should be approved');
            assert(user.wallet.realBalance === 150, 'Wallet should increase exactly once');
            results.push('PASS: verifyPayment credits once on SUCCESS');
        }

        // 2) verifyPayment already approved should not double credit
        {
            const tx = {
                status: 'Approved',
                amount: 100,
                userId: 'u1',
                save: async () => true
            };
            const user = {
                wallet: { realBalance: 200, bonusBalance: 0 },
                save: async () => true
            };
            Transaction.findOne = async () => tx;
            User.findById = async () => user;
            axios.post = async () => ({ data: { status: 'SUCCESS' } });

            const req = { body: { transactionId: 'TXN2' } };
            const res = makeRes();
            await verifyPayment(req, res);

            assert(res.statusCode === 200, 'already approved should return 200');
            assert(user.wallet.realBalance === 200, 'Wallet must not increase again');
            results.push('PASS: verifyPayment avoids double credit');
        }

        // 3) updateWithdrowalStatus deposit approved should credit wallet
        {
            const tx = {
                _id: 't1',
                type: 'Deposit',
                status: 'Pending',
                amount: 300,
                userId: 'u2',
                save: async function () {
                    return this;
                }
            };
            const user = {
                wallet: { realBalance: 700, bonusBalance: 0 },
                save: async () => true
            };
            Transaction.findById = async (id) => (id === 't1' ? tx : null);
            User.findById = async (id) => (id === 'u2' ? user : null);

            const req = { body: { transactionId: 't1', status: 'Approved' } };
            const res = makeRes();
            await updateWithdrowalStatus(req, res);

            assert(res.statusCode === 200, 'deposit approve should return 200');
            assert(user.wallet.realBalance === 1000, 'Deposit approval should credit wallet');
            assert(tx.status === 'Approved', 'Transaction status should be Approved');
            results.push('PASS: updateWithdrowalStatus approves deposit correctly');
        }

        // 4) updateWithdrowalStatus rejected withdrawal should refund wallet
        {
            const tx = {
                _id: 't2',
                type: 'Withdrawal',
                status: 'Pending',
                amount: 250,
                userId: 'u3',
                save: async function () {
                    return this;
                }
            };
            const user = {
                wallet: { realBalance: 500, bonusBalance: 0 },
                save: async () => true
            };
            Transaction.findById = async (id) => (id === 't2' ? tx : null);
            User.findById = async (id) => (id === 'u3' ? user : null);

            const req = { body: { transactionId: 't2', status: 'Rejected' } };
            const res = makeRes();
            await updateWithdrowalStatus(req, res);

            assert(res.statusCode === 200, 'withdrawal reject should return 200');
            assert(user.wallet.realBalance === 750, 'Rejected withdrawal should refund wallet');
            assert(tx.status === 'Rejected', 'Transaction status should be Rejected');
            results.push('PASS: updateWithdrowalStatus refunds rejected withdrawal');
        }

        for (const line of results) {
            console.log(line);
        }
        console.log('----------------------------------------');
        console.log(`Total: ${results.length}`);
        console.log(`Passed: ${results.length}`);
        console.log('Failed: 0');
    } finally {
        axios.post = original.axiosPost;
        Transaction.findOne = original.findOne;
        Transaction.findById = original.findById;
        User.findById = original.userFindById;
    }
};

run().catch((error) => {
    console.error(`FAIL: ${error.message}`);
    axios.post = original.axiosPost;
    Transaction.findOne = original.findOne;
    Transaction.findById = original.findById;
    User.findById = original.userFindById;
    process.exitCode = 1;
});
