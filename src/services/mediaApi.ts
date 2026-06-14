import apiClient from "../utils/apiClient";

export type MediaFolder = "plan-customizations" | "profiles";

export interface MediaUploadResponse {
  imageUrl: string;
  fileName: string;
}

export const mediaApi = {
  async uploadImage(file: File, folder: MediaFolder): Promise<MediaUploadResponse | null> {
    const data = new FormData();
    data.append("file", file);

    const result = await apiClient.postForm<MediaUploadResponse>(
      `/media/images?folder=${encodeURIComponent(folder)}`,
      data,
    );

    return result.ok ? result.data : null;
  },
};
