import { apiUpload } from "./api";

export const uploadService = {
  // Upload ảnh lên server, trả về { imageUrl: string }
  uploadImage: async (formData: FormData) => {
    return await apiUpload("/upload", formData);
  },
};
