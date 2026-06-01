import { Router } from "express";
import { 
    createUser, 
    loginUser, 
    getUser, 
    updateUser, 
    deleteUser, getUserProfile, getAllUsers, getAdminDashboardStats, getUserPassbook,
    changePassword, getUserByIdForAdmin, updatePaymentInfo, saveFcmToken, getReferralData, getBonusStats
} from "../Controller/userController.js";
import { authToken } from "../middleware/authToken.js";
import { verifyAdminToken } from "../middleware/verifyAdminToken.js";

const userRouter = Router();
userRouter.post("/create-user", createUser);
userRouter.post("/login-user", loginUser);
userRouter.get("/admin-view-user/:id", verifyAdminToken, getUserByIdForAdmin);
userRouter.get("/get-user/:id", verifyAdminToken, getUser);
userRouter.get("/get-all-users", verifyAdminToken, getAllUsers);
userRouter.get("/admin-dashboard-stats", verifyAdminToken, getAdminDashboardStats);
userRouter.get("/my-passbook", authToken, getUserPassbook);
userRouter.put("/update-user/:id", verifyAdminToken, updateUser);
userRouter.delete("/delete-user/:id", verifyAdminToken, deleteUser);
userRouter.get("/get-user-profile", authToken, getUserProfile);
userRouter.put("/change-password/:id", authToken, changePassword);
userRouter.put("/update-payment-info", authToken, updatePaymentInfo);
userRouter.post("/save-fcm-token", authToken, saveFcmToken);
userRouter.get("/admin/referrals", verifyAdminToken, getReferralData);
userRouter.get("/admin/bonus-stats", verifyAdminToken, getBonusStats);

export default userRouter;