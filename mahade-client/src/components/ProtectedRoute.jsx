import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useFetchProfile } from '../hooks/useFetchProfile';

// --- USER PROTECTED ROUTE ---
export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const fetchProfile = useFetchProfile();

  useEffect(() => {
    if (token && token !== "undefined" && token !== "null" && token !== "") {
      fetchProfile();
    }
  }, [token]);

  if (!token || token === "undefined" || token === "null" || token === "") {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data'); 

    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};


export const ProtectedRouteAdmin = ({ children }) => {
  const adminToken = localStorage.getItem('admin_token');
  const adminRawData = localStorage.getItem('admin_data');

  // 1. Agar token ya data nahi hai, toh login par bhej do
  if (!adminToken || adminToken === "undefined" || !adminRawData) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    return <Navigate to="/admin-login" replace />;
  }

  try {
    // 2. Data parse karo
    const adminData = JSON.parse(adminRawData);

    // 3. Clean Role Check (Sirf toLowerCase kafi hai)
    if (adminData?.role?.toLowerCase() !== 'admin') {
      return <Navigate to="/" replace />; // Normal user ko home par bhej do
    }
  } catch (error) {
    // 4. Agar JSON parse fail ho jaye (corrupt data), toh clear karke login par bhejo
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    return <Navigate to="/admin-login" replace />;
  }

  // 5. Sab sahi hai toh page render karo
  return children ? children : <Outlet />;
};