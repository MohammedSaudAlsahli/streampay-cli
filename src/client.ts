import * as crypto from 'crypto';
import axios, { AxiosInstance, AxiosError } from 'axios';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface StreamAppConfig {
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  branch?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
  search_term?: string;
  [key: string]: any;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    additional_info?: any;
  };
  detail?: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
    input?: any;
    ctx?: Record<string, any>;
  }>;
}

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class StreamApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly additionalInfo?: any;

  constructor(status: number, code: string, message: string, additionalInfo?: any) {
    super(message);
    this.name = 'StreamApiError';
    this.status = status;
    this.code = code;
    this.additionalInfo = additionalInfo;

    // Restore prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, StreamApiError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Default base URL
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = 'https://stream-app-service.streampay.sa/api/v2';

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class StreamAppClient {
  private client: AxiosInstance;
  private branch?: string;

  static readonly WEBHOOK_EVENTS = [
    'consumer.created',
    'consumer.updated',
    'consumer.deleted',
    'subscription.created',
    'subscription.updated',
    'subscription.canceled',
    'subscription.frozen',
    'subscription.unfrozen',
    'payment.succeeded',
    'payment.failed',
    'payment.refunded',
    'payment.pending',
    'invoice.created',
    'invoice.updated',
    'invoice.paid',
    'invoice.voided',
    'product.created',
    'product.updated',
    'product.deleted',
    'coupon.created',
    'coupon.updated',
    'coupon.deleted',
    'payment_link.created',
    'payment_link.completed',
  ];

  constructor(config: StreamAppConfig) {
    this.branch = config.branch;

    const apiKeyHeader = config.apiSecret
      ? Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64')
      : config.apiKey;

    this.client = axios.create({
      baseURL: config.baseUrl || DEFAULT_BASE_URL,
      headers: {
        'x-api-key': apiKeyHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'streampay-cli-community/1.0.0 (by @MohammedSaudAlsahli)'
      },
      paramsSerializer: (params: Record<string, any>) => {
        const parts: string[] = [];
        for (const [key, value] of Object.entries(params)) {
          if (value === undefined || value === null) continue;
          if (Array.isArray(value)) {
            for (const item of value) {
              parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
            }
          } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
          }
        }
        return parts.join('&');
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorBody>) => {
        if (error.response) {
          const data = error.response.data;
          const status = error.response.status;

          // Handle 422 validation errors: { detail: [{ loc, msg, type }] }
          if (Array.isArray(data?.detail) && data.detail.length > 0) {
            const messages = data.detail.map((d: any) => {
              const field = Array.isArray(d.loc) ? d.loc.join(' → ') : String(d.loc);
              return `${field}: ${d.msg}`;
            }).join('; ');
            throw new StreamApiError(
              status,
              'VALIDATION_ERROR',
              messages,
              data.detail,
            );
          }

          const apiError = data?.error;

          throw new StreamApiError(
            status,
            apiError?.code || `HTTP_${status}`,
            apiError?.message || error.message,
            apiError?.additional_info,
          );
        }

        // Network / timeout errors with no response
        throw new StreamApiError(0, 'NETWORK_ERROR', error.message);
      },
    );
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private addBranchHeader(headers: Record<string, string> = {}): Record<string, string> {
    if (this.branch) {
      return { ...headers, 'x-branch-id': this.branch };
    }
    return headers;
  }

  // -------------------------------------------------------------------------
  // User
  // -------------------------------------------------------------------------

  async getUserAndOrganizationInfo(): Promise<any> {
    const response = await this.client.get('/me', {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  // -------------------------------------------------------------------------
  // Consumers
  // -------------------------------------------------------------------------

  async createConsumer(data: any): Promise<any> {
    const response = await this.client.post('/consumers', data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async getConsumer(id: string): Promise<any> {
    const response = await this.client.get(`/consumers/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async getAllConsumers(params?: PaginationParams): Promise<any> {
    const response = await this.client.get('/consumers', {
      params,
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async updateConsumer(id: string, data: any): Promise<any> {
    const response = await this.client.put(`/consumers/${id}`, data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async deleteConsumer(id: string): Promise<any> {
    const response = await this.client.delete(`/consumers/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------

  async createProduct(data: any): Promise<any> {
    const response = await this.client.post('/products', data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async getProduct(id: string): Promise<any> {
    const response = await this.client.get(`/products/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async listProducts(params?: PaginationParams): Promise<any> {
    const response = await this.client.get('/products', {
      params,
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async updateProduct(id: string, data: any): Promise<any> {
    const response = await this.client.put(`/products/${id}`, data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<any> {
    const response = await this.client.delete(`/products/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  // -------------------------------------------------------------------------
  // Subscriptions
  // -------------------------------------------------------------------------

  async createSubscription(data: any): Promise<any> {
    const response = await this.client.post('/subscriptions', data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async getSubscription(id: string): Promise<any> {
    const response = await this.client.get(`/subscriptions/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async listSubscriptions(params?: PaginationParams): Promise<any> {
    const response = await this.client.get('/subscriptions', {
      params,
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async updateSubscription(id: string, data: any): Promise<any> {
    const response = await this.client.put(`/subscriptions/${id}`, data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async cancelSubscription(id: string, data?: any): Promise<any> {
    const response = await this.client.post(`/subscriptions/${id}/cancel`, data || {}, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async freezeSubscription(id: string, data: any): Promise<any> {
    const response = await this.client.post(`/subscriptions/${id}/freeze`, data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async listSubscriptionFreezes(id: string): Promise<any> {
    const response = await this.client.get(`/subscriptions/${id}/freeze`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async updateSubscriptionFreeze(subscriptionId: string, freezeId: string, data: any): Promise<any> {
    const response = await this.client.put(`/subscriptions/${subscriptionId}/freeze/${freezeId}`, data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async deleteSubscriptionFreeze(subscriptionId: string, freezeId: string): Promise<any> {
    const response = await this.client.delete(`/subscriptions/${subscriptionId}/freeze/${freezeId}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async unfreezeSubscription(id: string): Promise<any> {
    const response = await this.client.post(`/subscriptions/${id}/unfreeze`, {}, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  // -------------------------------------------------------------------------
  // Invoices
  // -------------------------------------------------------------------------

  async createInvoice(data: any): Promise<any> {
    const response = await this.client.post('/invoices', data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async getInvoice(id: string): Promise<any> {
    const response = await this.client.get(`/invoices/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async listInvoices(params?: PaginationParams): Promise<any> {
    const response = await this.client.get('/invoices', {
      params,
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async updateInvoiceInPlace(id: string, data: any): Promise<any> {
    const response = await this.client.patch(`/invoices/${id}/inplace`, data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async sendInvoice(id: string): Promise<any> {
    const response = await this.client.post(`/invoices/${id}/send`, {}, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async acceptInvoice(id: string): Promise<any> {
    const response = await this.client.post(`/invoices/${id}/accept`, {}, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async rejectInvoice(id: string): Promise<any> {
    const response = await this.client.post(`/invoices/${id}/reject`, {}, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async completeInvoice(id: string): Promise<any> {
    const response = await this.client.post(`/invoices/${id}/complete`, {}, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async cancelInvoice(id: string): Promise<any> {
    const response = await this.client.post(`/invoices/${id}/cancel`, {}, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  // -------------------------------------------------------------------------
  // Payments
  // -------------------------------------------------------------------------

  async getPayment(id: string): Promise<any> {
    const response = await this.client.get(`/payments/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async listPayments(params?: PaginationParams): Promise<any> {
    const response = await this.client.get('/payments', {
      params,
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async markPaymentAsPaid(id: string, data: any): Promise<any> {
    const response = await this.client.post(`/payments/${id}/mark-paid`, data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async refundPayment(id: string, data?: any): Promise<any> {
    const response = await this.client.post(`/payments/${id}/refund`, data || {}, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async autoChargeOnDemand(paymentId: string): Promise<any> {
    const response = await this.client.post(`/payments/auto-charge-on-demand/${paymentId}`, {}, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  // -------------------------------------------------------------------------
  // Coupons
  // -------------------------------------------------------------------------

  async createCoupon(data: any): Promise<any> {
    const response = await this.client.post('/coupons', data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async getCoupon(id: string): Promise<any> {
    const response = await this.client.get(`/coupons/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async listCoupons(params?: PaginationParams): Promise<any> {
    const response = await this.client.get('/coupons', {
      params,
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async updateCoupon(id: string, data: any): Promise<any> {
    const response = await this.client.put(`/coupons/${id}`, data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async deleteCoupon(id: string): Promise<any> {
    const response = await this.client.delete(`/coupons/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  // -------------------------------------------------------------------------
  // Payment Links (Checkout)
  // -------------------------------------------------------------------------

  async createPaymentLink(data: any): Promise<any> {
    const response = await this.client.post('/payment_links', data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async getPaymentLink(id: string): Promise<any> {
    const response = await this.client.get(`/payment_links/${id}`, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async listPaymentLinks(params?: PaginationParams): Promise<any> {
    const response = await this.client.get('/payment_links', {
      params,
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  async updatePaymentLinkStatus(id: string, data: any): Promise<any> {
    const response = await this.client.patch(`/payment_links/${id}/status`, data, {
      headers: this.addBranchHeader(),
    });
    return response.data;
  }

  // -------------------------------------------------------------------------
  // Webhook Signature Verification
  // -------------------------------------------------------------------------

  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    if (signature.length !== expected.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
