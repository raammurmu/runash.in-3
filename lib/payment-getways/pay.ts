import crypto from "crypto"
import { executeWithRetry } from "@/lib/resilience"

export interface PayConfig {
  merchantKey: string
  merchantSalt: string
  baseUrl: string
}

export class PayGateway {
  private config: PayConfig

  constructor(config: PayConfig) {
    this.config = config
  }

  generateHash(data: string) {
    return crypto.createHash("sha512").update(data).digest("hex")
  }

  async createUpiPayment(options: {
    amount: number
    productInfo: string
    firstName: string
    email: string
    phone: string
    txnId: string
    successUrl: string
    failureUrl: string
    upi: {
      vpa: string
    }
  }) {
    try {
      const hashString = `${this.config.merchantKey}|${options.txnId}|${options.amount}|${options.productInfo}|${options.firstName}|${options.email}|||||||||||${this.config.merchantSalt}`
      const hash = this.generateHash(hashString)

      const paymentData = {
        key: this.config.merchantKey,
        txnid: options.txnId,
        amount: options.amount,
        productinfo: options.productInfo,
        firstname: options.firstName,
        email: options.email,
        phone: options.phone,
        surl: options.successUrl,
        furl: options.failureUrl,
        hash: hash,
        pg: "UPI",
        bankcode: "UPI",
        vpa: options.upi.vpa,
      }

      // In a real implementation, you would make an HTTP request to PayU API
      const response = await executeWithRetry(
        async () =>
          fetch(`${this.config.baseUrl}/payment/op/v1/createPaymentRequest`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.merchantKey}`,
            },
            body: JSON.stringify(paymentData),
          }),
        {
          maxAttempts: 3,
          baseDelayMs: 300,
          maxDelayMs: 1500,
          jitterRatio: 0.2,
          timeoutMs: 5000,
          isRetryableError: () => true,
        },
      )

      const result = await response.json()

      if (result.status === "success") {
        return {
          success: true,
          data: {
            paymentId: result.data.paymentId,
            txnId: options.txnId,
            amount: options.amount,
            status: result.data.status,
            paymentUrl: result.data.paymentUrl,
          },
        }
      } else {
        return {
          success: false,
          error: result.message,
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async verifyPayment(response: {
    mihpayid: string
    mode: string
    status: string
    key: string
    txnid: string
    amount: string
    productinfo: string
    firstname: string
    email: string
    hash: string
  }) {
    try {
      const hashString = `${this.config.merchantSalt}|${response.status}|||||||||||${response.email}|${response.firstname}|${response.productinfo}|${response.amount}|${response.txnid}|${response.key}`
      const expectedHash = this.generateHash(hashString)

      const isValid = expectedHash === response.hash

      return {
        success: true,
        isValid,
        data: {
          paymentId: response.mihpayid,
          txnId: response.txnid,
          status: response.status,
          amount: response.amount,
          mode: response.mode,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      const response = await executeWithRetry(
        async () =>
          fetch(`${this.config.baseUrl}/payment/op/v1/getPaymentStatus`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.merchantKey}`,
            },
            body: JSON.stringify({
              merchantKey: this.config.merchantKey,
              paymentId: paymentId,
            }),
          }),
        {
          maxAttempts: 3,
          baseDelayMs: 300,
          maxDelayMs: 1500,
          jitterRatio: 0.2,
          timeoutMs: 5000,
          isRetryableError: () => true,
        },
      )

      const result = await response.json()

      return {
        success: true,
        data: result.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}
