import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice'; 
import Axios from '../utils/axios';
import SummaryApi from '../common/SummerAPI';

export const useFetchProfile = () => {
    const dispatch = useDispatch();

    const fetchProfile = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const res = await Axios({
                url: SummaryApi.getUserProfile.url,
                method: SummaryApi.getUserProfile.method,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.success) { 
                dispatch(setUser(res.data.user)); 
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
        }
    };

    return fetchProfile; 
};