/**
 * Generic API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
