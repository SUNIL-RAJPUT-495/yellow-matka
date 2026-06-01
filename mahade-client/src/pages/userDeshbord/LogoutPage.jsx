import React from 'react'
import { useNavigate } from 'react-router-dom'
export const LogoutPage = () => {
    const navigate = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("walletBalance");
        navigate("/login");
    }
  return (
    <div>
        <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
