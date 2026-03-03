import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, {
  loginApi,
  signupApi,
  getPublicPassportApi,
  getMyPassportsApi,
  initiateTransferApi,
  acceptTransferApi,
  cancelTransferApi,
  getActiveTransferApi,
  submitServiceApi,
  getServiceCaseApi,
  approveServiceApi,
  mintApi,
  releaseApi
} from '../api';

export const useDPPStore = create(
  persist(
    (set, get) => ({
      currentUser: null,

      // Async Auth Actions
      login: async (email, password) => {
        try {
          const res = await loginApi({ email, password });
          set({ currentUser: res.data });
        } catch (err) {
          throw new Error(err.response?.data?.message || err.response?.data?.error || "로그인에 실패했습니다.");
        }
      },

      logout: () => set({ currentUser: null }),

      signup: async (email, password, role, phone, businessNumber, brandName) => {
        try {
          await signupApi({
            email,
            password,
            role,
            phone,
            businessNumber: businessNumber?.trim() ? businessNumber.trim() : null,
            brandName: brandName?.trim() ? brandName.trim() : null
          });
          // Signup response does not include accessToken, so auth state must not be set here.
          // User should login explicitly after successful signup.
        } catch (err) {
          throw new Error(err.response?.data?.message || err.response?.data?.error || "회원가입에 실패했습니다.");
        }
      },

      // API Wrappers for direct component usage
      getPublicPassport: async (qrCode) => {
        const res = await getPublicPassportApi(qrCode);
        return res.data;
      },

      getMyPassports: async (page = 0, size = 5) => {
        const user = get().currentUser;
        if (!user) throw new Error("Not logged in");
        const res = await getMyPassportsApi(page, size);
        return res.data;
      },

      initiateTransfer: async (data) => {
        // data: { passportId, method, receiptNumber, evidenceUrls }
        // fromUserId is extracted from JWT on the server side
        const res = await initiateTransferApi(data);
        return res.data;
      },

      getActiveTransfer: async (passportId) => {
        const res = await getActiveTransferApi(passportId);
        return res.data;
      },

      getTransferDetails: async (tokenId) => {
        const res = await api.get(`/transfers/token/${tokenId}`);
        return res.data;
      },
      submitRegistration: async (data) => {
        const user = get().currentUser;
        if (!user?.accessToken) throw new Error("로그인이 필요합니다. 다시 로그인해 주세요.");
        const res = await api.post(`/registrations/submit`, data);
        return res.data;
      },
      getUploadUrl: async (filename) => {
        const user = get().currentUser;
        if (!user?.accessToken) throw new Error("로그인이 필요합니다. 다시 로그인해 주세요.");
        const res = await api.get(`/registrations/upload-url`, { params: { filename } });
        return res.data;
      },
      listRegistrations: async (page = 0, size = 20) => {
        const res = await api.get(`/registrations/list`, { params: { page, size } });
        return res.data;
      },
      getMyRegistrations: async (page = 0, size = 20) => {
        // requesterId is extracted from JWT on the server side
        const res = await api.get(`/registrations/my`, { params: { page, size } });
        return res.data;
      },
      approveRegistration: async (requestId) => {
        const user = get().currentUser;
        if (!user || user.role !== 'ADMIN') throw new Error("Admin authorization required");
        // adminId is extracted from JWT on the server side
        await api.post(`/registrations/approve/${requestId}`);
      },
      rejectRegistration: async (requestId) => {
        const user = get().currentUser;
        if (!user || user.role !== 'ADMIN') throw new Error("Admin authorization required");
        await api.post(`/registrations/reject/${requestId}`);
      },

      acceptTransfer: async (tokenOrCode) => {
        const user = get().currentUser;
        if (!user) throw new Error("Not logged in");
        // toUserId is extracted from JWT on the server side
        await acceptTransferApi({ tokenOrCode });
      },

      cancelTransfer: async (tokenId) => {
        await cancelTransferApi(tokenId);
      },

      mint: async (modelName, serialNumber, attributes) => {
        const user = get().currentUser;
        if (!user || user.role !== 'BRAND') throw new Error('Brand authorization required');
        const res = await mintApi({ modelName, serialNumber, attributes });
        return res.data;
      },

      release: async (passportId) => {
        const user = get().currentUser;
        if (!user || user.role !== 'BRAND') throw new Error('Brand authorization required');
        const res = await releaseApi({ passportId });
        return res.data;
      },

      claimAsset: async (tokenOrCode) => {
        // Claim is essentially just accepting a transfer where fromUserId was null
        const user = get().currentUser;
        if (!user) throw new Error("Not logged in");
        // toUserId is extracted from JWT on the server side
        await acceptTransferApi({ tokenOrCode });
      },

      submitService: async (assetId, kind) => {
        const user = get().currentUser;
        if (!user || user.role !== 'PROVIDER') throw new Error("Not authorized");
        const res = await submitServiceApi({ assetId, kind });
        return res.data;
      },

      getServiceCase: async (caseId) => {
        const res = await getServiceCaseApi(caseId);
        return res.data;
      },

      approveService: async (caseId) => {
        const user = get().currentUser;
        if (!user) throw new Error("Not logged in");
        await approveServiceApi(caseId);
      }
    }),
    {
      name: 'dpp-storage',
      partialize: (state) => ({ currentUser: state.currentUser }), // Only persist auth user profile
    }
  )
);
