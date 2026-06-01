import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userData: null,
    wallet: { realBalance: 0, bonusBalance: 0 },
    walletBalance: 0,
    isAuthenticated: false,
};

function syncWalletState(state, payload) {
    const w = payload?.wallet;
    if (w && typeof w === 'object') {
        state.wallet = {
            realBalance: Number(w.realBalance) || 0,
            bonusBalance: Number(w.bonusBalance) || 0,
        };
    } else if (payload?.walletBalance != null) {
        const total = Number(payload.walletBalance) || 0;
        state.wallet = { realBalance: total, bonusBalance: 0 };
    } else {
        state.wallet = { realBalance: 0, bonusBalance: 0 };
    }
    state.walletBalance = state.wallet.realBalance + state.wallet.bonusBalance;
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userData = action.payload;
            syncWalletState(state, action.payload);
            state.isAuthenticated = true;
        },
        updateWallet: (state, action) => {
            const p = action.payload;
            if (typeof p === 'number') {
                state.wallet.realBalance = p;
                state.walletBalance = state.wallet.realBalance + state.wallet.bonusBalance;
            } else if (p && typeof p === 'object' && p.wallet) {
                syncWalletState(state, p);
            }
        },
        logout: (state) => {
            state.userData = null;
            state.wallet = { realBalance: 0, bonusBalance: 0 };
            state.walletBalance = 0;
            state.isAuthenticated = false;
        }
    }
});

export const { setUser, updateWallet, logout } = userSlice.actions;
export default userSlice.reducer;