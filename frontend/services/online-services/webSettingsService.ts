import axiosInstance from "@/lib/axios";

export interface WebSettings {
  logoUrl: string | null;
  faviconUrl: string | null;
  logoKey: string | null;
  faviconKey: string | null;
}

export interface WebSettingsResponse {
  success: boolean;
  data: WebSettings;
}

export interface UploadLogoResponse {
  success: boolean;
  message: string;
  data: {
    logoUrl: string;
    logoKey: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Get web settings (logo and favicon)
 */
export const getWebSettings = async (): Promise<WebSettingsResponse> => {
  try {
    const response = await axiosInstance.get<WebSettingsResponse>(
      `/api/web/web-settings`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching web settings:", error);
    // Return default values on error
    return {
      success: false,
      data: {
        logoUrl: null,
        faviconUrl: null,
        logoKey: null,
        faviconKey: null,
      },
    };
  }
};

/**
 * Upload logo
 */
export const uploadLogo = async (file: File): Promise<UploadLogoResponse> => {
  try {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await axiosInstance.post<UploadLogoResponse>(
      `/api/web/logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error uploading logo:", error);
    throw new Error(
      error.response?.data?.error || "Failed to upload logo"
    );
  }
};

/**
 * Delete logo
 */
export const deleteLogo = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete<{ success: boolean; message: string }>(
      `${API_URL}/api/web/logo`,Instance.delete<{ success: boolean; message: string }>(
      `/api/web/logo`
    return response.data;
  } catch (error: any) {
    console.error("Error deleting logo:", error);
    throw new Error(
      error.response?.data?.error || "Failed to delete logo"
    );
  }
};
