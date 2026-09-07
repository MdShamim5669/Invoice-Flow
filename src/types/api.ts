export interface ApiResponse<T> {
  statusCode?: number;
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
}

export interface ApiError {
  success: boolean;
  message: string;
  errorDetails?: Array<{ field: string; issue: string }> | null;
  stack?: string;
}
