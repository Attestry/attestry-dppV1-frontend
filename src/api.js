import axios from 'axios';
import { extractPublicPassportCode } from './utils/qrPayload';

const api = axios.create({
    baseURL: 'http://3.35.149.48/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
    const storage = localStorage.getItem('dpp-storage');
    if (storage) {
        try {
            const { state } = JSON.parse(storage);
            if (state?.currentUser?.accessToken) {
                config.headers.Authorization = `Bearer ${state.currentUser.accessToken}`;
            }
        } catch (e) {
            console.error('Error parsing auth storage', e);
        }
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => {
    const payload = response.data;
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'code')
        && Object.prototype.hasOwnProperty.call(payload, 'data')) {
        response.data = payload.data;
    }
    return response;
}, (error) => {
    // If the server returns an empty body (e.g. 403 Forbidden), error.response.data might be empty string or undefined
    if (!error.response || !error.response.data) {
        if (error.response?.status === 403) {
            return Promise.reject(new Error("접근 권한이 없거나 이미 처리된 요청입니다."));
        }
        return Promise.reject(new Error("네트워크 오류가 발생했습니다."));
    }

    const payload = error.response.data;
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'code')) {
        // Backward compatibility: old UI reads error field
        error.response.data = {
            ...payload,
            error: payload.message || payload.error || "요청 처리에 실패했습니다."
        };
    } else if (typeof payload === 'string' && payload.trim() === '') {
        // Handle empty string payload which causes JSON parse errors in some UI components
        error.response.data = {
            error: error.response.status === 403 ? "접근 권한이 없거나 이미 처리된 요청입니다." : "서버 오류가 발생했습니다."
        };
    }
    return Promise.reject(error);
});

// Auth
export const signupApi = (data) => api.post('/auth/signup', data);
export const loginApi = (data) => api.post('/auth/login', data);

// Passports
export const getPublicPassportApi = (qrPayload) => {
    const qrCode = extractPublicPassportCode(qrPayload);
    return api.get(`/passports/${encodeURIComponent(qrCode)}`);
};
export const getMyPassportsApi = (page = 0, size = 5) => api.get('/passports', { params: { page, size } });

// Transfers
export const initiateTransferApi = (data) => api.post('/transfers/initiate', data);
export const acceptTransferApi = (data) => api.post('/transfers/accept', data);
export const cancelTransferApi = (tokenId) => api.post(`/transfers/cancel/${tokenId}`);
export const getActiveTransferApi = (passportId) => api.get(`/transfers/active?passportId=${passportId}`);

// Services
export const submitServiceApi = (data) => api.post('/services/submit', data);
export const getServiceCaseApi = (caseId) => api.get(`/services/${caseId}`);
export const approveServiceApi = (caseId) => api.post(`/services/${caseId}/approve`);

// Brand
export const mintApi = (data) => api.post('/brands/mint', data);
export const releaseApi = (data) => api.post('/brands/release', data);

// Admin User Management
export const getPendingUsersApi = (page = 0, size = 20) =>
    api.get('/admin/users/pending', { params: { page, size } });
export const approveUserApi = (userId) => api.post(`/admin/users/approve/${userId}`);
export const rejectUserApi = (userId) => api.post(`/admin/users/reject/${userId}`);

export default api;
