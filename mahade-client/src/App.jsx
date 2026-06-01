import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ProtectedRoute, ProtectedRouteAdmin } from "./components/ProtectedRoute"
import { Sign } from "./pages/Sign"
import { Login } from "./pages/Login"
import MainLayerOut from "./layerout/MainLayerOut"
import Profile from "./pages/userDeshbord/Profile"
import GamerRatesPage from "./pages/userDeshbord/GamerRatesPage"
import Home from "./pages/userDeshbord/Home"
import { BidPage } from "./pages/userDeshbord/BidPage"
import { PassbookPage } from "./pages/userDeshbord/PassbookPage"
import { PaymentPage } from "./pages/userDeshbord/PaymentPage"
import { AboutPage } from "./pages/userDeshbord/AboutPage"
import { ReferPage } from "./pages/userDeshbord/ReferPage"
import { NoticePage } from "./pages/userDeshbord/NoticePage"
import { HelpSupport } from "./pages/userDeshbord/HelpSupport"
import { HowTOPlay } from "./pages/userDeshbord/HowTOPlay"
import GamePlay from "./pages/userDeshbord/GamePlay"
import DepositPage from "./pages/userDeshbord/DepositPage"
import WithdrawalPage from "./pages/userDeshbord/WithdrawalPage"
import JodiChart from "./pages/userDeshbord/JodiChart"
import PanelChart from "./pages/userDeshbord/PanelChart"
import ChatSupport from "./pages/userDeshbord/ChatSupport"
import GameResultsPage from "./pages/userDeshbord/GameResultsPage"
import NotificationsPage from "./pages/userDeshbord/NotificationsPage"
import RajanMarketsPage from "./pages/userDeshbord/RajanMarketsPage"
import ChangePassword from "./pages/userDeshbord/ChangePassword"
import { TimeTable } from "./pages/userDeshbord/TimeTable"
import { TelegramPage } from "./pages/userDeshbord/TelegramPage"
import GaliDesawarPage from "./pages/userDeshbord/GaliDesawarPage"
import GaliDesawarPlay from "./pages/userDeshbord/GaliDesawarPlay"
import GaliDesawarHistory from "./pages/userDeshbord/GaliDesawarHistory"



// admin 
import { AdminLogin } from "./pages/AdminLogin"
import { AdminSign } from "./pages/AdminSign"
import { AdminLayout } from "./layerout/AdminLayout"
import { AdminDashboard } from "./pages/adminDashbord/AdminDashboard"
import { AddGamesPages } from "./pages/adminDashbord/AddGamesPages"
import { AdminBidPage } from "./pages/adminDashbord/AdminBidPage"
import { UpiSettingsPage } from "./pages/adminDashbord/UpiSettingsPage"
import { ReferralManagementPage } from "./pages/adminDashbord/ReferralManagementPage"
import { BonusManagementPage } from "./pages/adminDashbord/BonusManagementPage"
import { WebsiteSettingsPage } from "./pages/adminDashbord/WebsiteSettingsPage"
import { DeclearResult } from "./pages/adminDashbord/DeclearResult"
import { WithdrawalRequestsPage } from "./pages/adminDashbord/WithdrawalRequestsPage"
import { DepositRequestsManagement } from "./pages/adminDashbord/DepositRequestsManagement"
import { GameResultAdminPanel } from "./pages/adminDashbord/GameResultAdminPanel"
import { NotificationSenderPage } from "./pages/adminDashbord/NotificationSenderPage"
import AdminChatDashboard from "./pages/adminDashbord/AdminChatDashboard"
import BidHistoryPage from "./pages/userDeshbord/BidHistoryPage"
import { AddBankAccount } from "./pages/userDeshbord/AddBankAccount"
import { AddPaytm } from "./pages/userDeshbord/AddPaytm"
import { AddPhonePe } from "./pages/userDeshbord/AddPhonePe"
import { AddUpi } from "./pages/userDeshbord/AddUpi"
import { ViewUser } from "./pages/adminDashbord/ViewUser"
import { Toaster } from 'react-hot-toast';
import NotFound from "./pages/NotFound"

function App() {
    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <BrowserRouter>
                <Routes>
                    <Route path="/Login" element={<Login />} />
                    <Route path="/sign" element={<Sign />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin-signup" element={<AdminSign />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="ChatSupport" element={<ChatSupport />} />
                        <Route path="/" element={<MainLayerOut />}>
                            <Route index element={<Home />} />
                            <Route path="Profile" element={<Profile />} />
                            <Route path="GamerRatesPage" element={<GamerRatesPage />} />
                            <Route path="history" element={<BidPage />} />
                            <Route path="BidPage" element={<BidPage />} />
                            <Route path="GameResult" element={<GameResultsPage />} />
                            <Route path="passbook" element={<PassbookPage />} />
                            <Route path="payment" element={<PaymentPage />} />
                            <Route path="wallet" element={<PaymentPage />} />
                            <Route path="about" element={<AboutPage />} />
                            <Route path="support" element={<AboutPage />} />
                            <Route path="help-support" element={<HelpSupport />} />
                            <Route path="refer" element={<ReferPage />} />
                            <Route path="notice" element={<NoticePage />} />
                            <Route path="HowTOPlay" element={<HowTOPlay />} />
                            <Route path="add-funds" element={<DepositPage />} />
                            <Route path="withdrawal" element={<WithdrawalPage />} />
                            <Route path="jodi-chart" element={<JodiChart />} />
                            <Route path="panel-chart" element={<PanelChart />} />
                            <Route path="/play/:id" element={<GamePlay />} />

                            <Route path="BidHistoryPage" element={<BidHistoryPage />} />
                            <Route path="NotificationsPage" element={<NotificationsPage />} />
                            <Route path="RajanMarketsPage" element={<RajanMarketsPage />} />
                            <Route path="ChangePassword" element={<ChangePassword />} />
                            <Route path="/add-bank" element={<AddBankAccount />} />
                            <Route path="/add-paytm" element={<AddPaytm />} />
                            <Route path="/add-phonepe" element={<AddPhonePe />} />
                            <Route path="/add-upi" element={<AddUpi />} />
                            <Route path="/time-table" element={<TimeTable />} />
                            <Route path="/telegram" element={<TelegramPage />} />
                            
                            <Route path="gali-desawar" element={<GaliDesawarPage />} />
                            <Route path="gali-desawar/play/:id" element={<GaliDesawarPlay />} />
                            <Route path="gali-desawar/history" element={<GaliDesawarHistory />} />
                        </Route>

                    </Route>
                    <Route element={<ProtectedRouteAdmin />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="AddGame" element={<AddGamesPages />} />
                            <Route path="AdminBid" element={<AdminBidPage />} />
                            <Route path="upi" element={<UpiSettingsPage />} />
                            <Route path="contact" element={<WebsiteSettingsPage />} />
                            <Route path="DeclearResult" element={<DeclearResult />} />
                            <Route path="Withdraw" element={<WithdrawalRequestsPage />} />
                            <Route path="Payment" element={<DepositRequestsManagement />} />
                            <Route path="ResultDecleare" element={<GameResultAdminPanel />} />
                            <Route path="NotificationSender" element={<NotificationSenderPage />} />
                            <Route path="admin-chat" element={<AdminChatDashboard />} />
                            <Route path="view-user/:id" element={<ViewUser />} />
                            <Route path="referal" element={<ReferralManagementPage />} />
                            <Route path="bonus" element={<BonusManagementPage />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter >
        </>
    )
}

export default App;