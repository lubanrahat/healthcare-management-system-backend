export interface ApiResponse<T = unknown> {
  success: boolean;

  message?: string;
  data?: T;

  error?: {
    code: string;
    message: string;
    details?: unknown;
  };

  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
