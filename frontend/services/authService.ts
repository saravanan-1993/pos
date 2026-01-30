import axiosInstance from '@/lib/axios';
import { User } from '@/types/auth';

class AuthService {
  /**
   * Get current admin user data
   */
  async getCurrentAdmin(): Promise<User> {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error fetching current admin:', error);
      // Return default admin data with INR currency
      return {
        id: '',
        email: '',
        name: 'Admin',
        role: 'admin',
        isVerified: true,
        currency: 'INR',
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await axiosInstance.get(`/api/auth/users/${userId}`);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Update admin profile
   */
  async updateAdminProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await axiosInstance.put('/api/auth/me', data);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw error;
    }
  }

  /**
   * Get admin currency preference
   */
  async getAdminCurrency(): Promise<string> {
    try {
      const admin = await this.getCurrentAdmin();
      return admin.currency || 'INR';
    } catch (error) {
      console.error('Error fetching admin currency:', error);
      return 'INR';
    }
  }
}

export const authService = new AuthService();
