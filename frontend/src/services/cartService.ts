import { apiService } from './api';
import type { ApiResponse, Cart, CartItem } from '@/types';

/**
 * Cart Management Service
 * Handles shopping cart operations including adding, updating, and removing items
 */
export const cartService = {
  /**
   * Get current user's cart
   * @returns Promise<ApiResponse<Cart>>
   */
  getCart: async (params?: any): Promise<ApiResponse<Cart>> => {
    return apiService.get<Cart>('/cart', { params });
  },

  /**
   * Add item to cart
   * @param item - Cart item data
   * @returns Promise<ApiResponse<Cart>>
   */
  addItem: async (item: Partial<CartItem>): Promise<ApiResponse<Cart>> => {
    return apiService.post<Cart>('/cart/add', item);
  },

  /**
   * Update cart item
   * @param itemId - Cart item ID
   * @param updates - Partial cart item updates
   * @returns Promise<ApiResponse<Cart>>
   */
  updateItem: async (itemId: number, updates: Partial<CartItem>): Promise<ApiResponse<Cart>> => {
    return apiService.put<Cart>('/cart/update', { itemId, ...updates });
  },

  /**
   * Remove item from cart
   * @param itemId - Cart item ID to remove
   * @returns Promise<ApiResponse<Cart>>
   */
  removeItem: async (itemId: number): Promise<ApiResponse<Cart>> => {
    return apiService.delete<Cart>(`/cart/remove/${itemId}`);
  },

  /**
   * Clear all items from cart
   * @returns Promise<ApiResponse<void>>
   */
  clearCart: async (): Promise<ApiResponse<void>> => {
    return apiService.delete<void>('/cart/clear');
  },

  /**
   * Apply promo code to cart
   * @param code - Promo code string
   * @returns Promise<ApiResponse<Cart>>
   */
  applyPromoCode: async (code: string): Promise<ApiResponse<Cart>> => {
    return apiService.post<Cart>('/cart/apply-promo', { promoCode: code });
  },

  /**
   * Remove promo code from cart
   * @returns Promise<ApiResponse<Cart>>
   */
  removePromoCode: async (): Promise<ApiResponse<Cart>> => {
    return apiService.delete<Cart>('/cart/remove-promo');
  },

  /**
   * Calculate cart totals (recalculate all prices)
   * @returns Promise<ApiResponse<Cart>>
   */
  calculateTotal: async (): Promise<ApiResponse<Cart>> => {
    return apiService.get<Cart>('/cart/calculate');
  },

  /**
   * Validate cart items before checkout
   * @returns Promise<ApiResponse<{ valid: boolean; errors?: string[] }>>
   */
  validateCart: async (): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> => {
    return apiService.post('/cart/validate');
  },

  /**
   * Get abandoned carts (admin only)
   * @param params - Query parameters
   * @returns Promise<ApiResponse<Cart[]>>
   */
  getAbandonedCarts: async (params?: any): Promise<ApiResponse<Cart[]>> => {
    return apiService.get<Cart[]>('/cart/abandoned', { params });
  },

  /**
   * Restore cart from session
   * @param sessionId - Session ID to restore
   * @returns Promise<ApiResponse<Cart>>
   */
  restoreCart: async (sessionId: string): Promise<ApiResponse<Cart>> => {
    return apiService.post<Cart>('/cart/restore', { sessionId });
  },
};

export default cartService;
