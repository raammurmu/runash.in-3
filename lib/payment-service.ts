import { getCorrelationId, logEvent } from "@/lib/observability"

export interface PaymentMethod {
  id: string
  name: string
  type: "card" | "upi" | "netbanking" | "wallet" | "bnpl"
  provider: string
  icon: string
  enabled: boolean
  processingFee: number
  description: string
  supportedCurrencies: string[]
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: "pending" | "processing" | "succeeded" | "failed" | "canceled"
  paymentMethod: string
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface PaymentTransaction {
  id: string
  intentId: string
  amount: number
  currency: string
  status: "pending" | "processing" | "completed" | "failed" | "refunded"
  paymentMethod: string
  provider: string
  providerTransactionId?: string
  processingFee: number
  netAmount: number
  failureReason?: string
  refundAmount?: number
  refundReason?: string
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface PaymentAnalytics {
  totalRevenue: number
  totalTransactions: number
  successRate: number
  averageTransactionValue: number
  topPaymentMethods: Array<{
    method: string
    count: number
    percentage: number
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    transactions: number
  }>
  recentTransactions: PaymentTransaction[]
}

export class PaymentService {
  private static paymentMethods: PaymentMethod[] = [
    {
      id: "stripe-card",
      name: "Credit/Debit Card",
      type: "card",
      provider: "stripe",
      icon: "💳",
      enabled: true,
      processingFee: 2.9,
      description: "Visa, Mastercard, American Express",
      supportedCurrencies: ["INR", "USD", "EUR"],
    },
    {
      id: "razorpay-upi",
      name: "UPI",
      type: "upi",
      provider: "razorpay",
      icon: "📱",
      enabled: true,
      processingFee: 0.5,
      description: "GPay, PhonePe, Paytm, BHIM",
      supportedCurrencies: ["INR"],
    },
    {
      id: "razorpay-netbanking",
      name: "Net Banking",
      type: "netbanking",
      provider: "razorpay",
      icon: "🏦",
      enabled: true,
      processingFee: 1.5,
      description: "All major Indian banks",
      supportedCurrencies: ["INR"],
    },
    {
      id: "paytm-wallet",
      name: "Paytm Wallet",
      type: "wallet",
      provider: "paytm",
      icon: "💰",
      enabled: true,
      processingFee: 1.0,
      description: "Pay with Paytm balance",
      supportedCurrencies: ["INR"],
    },
    {
      id: "phonepe-upi",
      name: "PhonePe",
      type: "upi",
      provider: "phonepe",
      icon: "📞",
      enabled: true,
      processingFee: 0.5,
      description: "PhonePe UPI payments",
      supportedCurrencies: ["INR"],
    },
    {
      id: "googlepay-upi",
      name: "Google Pay",
      type: "upi",
      provider: "googlepay",
      icon: "🔍",
      enabled: true,
      processingFee: 0.5,
      description: "Google Pay UPI",
      supportedCurrencies: ["INR"],
    },
    {
      id: "amazonpay-wallet",
      name: "Amazon Pay",
      type: "wallet",
      provider: "amazonpay",
      icon: "📦",
      enabled: true,
      processingFee: 1.2,
      description: "Amazon Pay wallet",
      supportedCurrencies: ["INR"],
    },
    {
      id: "simpl-bnpl",
      name: "Buy Now Pay Later",
      type: "bnpl",
      provider: "simpl",
      icon: "⏰",
      enabled: true,
      processingFee: 2.0,
      description: "3 installments, no interest",
      supportedCurrencies: ["INR"],
    },
  ]

  private static transactions: PaymentTransaction[] = []

  static async getPaymentMethods(currency = "INR"): Promise<PaymentMethod[]> {
    return this.paymentMethods.filter((method) => method.enabled && method.supportedCurrencies.includes(currency))
  }

  static async createPaymentIntent(
    amount: number,
    currency: string,
    paymentMethodId: string,
    metadata: Record<string, any> = {},
  ): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: "pending",
      paymentMethod: paymentMethodId,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    logEvent("info", "Payment intent initialized", {
      intentId: intent.id,
      amount,
      currency,
      paymentMethodId,
      correlationId: getCorrelationId(),
    })

    return intent
  }

  static async processPayment(intentId: string): Promise<PaymentTransaction> {
    // Simulate payment processing
    const paymentMethod = this.paymentMethods.find((m) => m.id === intentId.split("_")[2])
    const amount = Math.floor(Math.random() * 10000) + 100 // Random amount for demo
    const processingFee = paymentMethod ? (amount * paymentMethod.processingFee) / 100 : 0
    const netAmount = amount - processingFee

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1

    const transaction: PaymentTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      intentId,
      amount,
      currency: "INR",
      status: isSuccess ? "completed" : "failed",
      paymentMethod: paymentMethod?.name || "Unknown",
      provider: paymentMethod?.provider || "unknown",
      providerTransactionId: `${paymentMethod?.provider}_${Date.now()}`,
      processingFee,
      netAmount: isSuccess ? netAmount : 0,
      failureReason: isSuccess ? undefined : "Insufficient funds",
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.transactions.push(transaction)

    logEvent("info", "Payment transaction processed", {
      transactionId: transaction.id,
      intentId,
      status: transaction.status,
      provider: transaction.provider,
      correlationId: getCorrelationId(),
    })

    return transaction
  }

  static async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    return this.transactions.find((t) => t.id === transactionId) || null
  }

  static async refundTransaction(transactionId: string, amount: number, reason: string): Promise<PaymentTransaction> {
    const transaction = this.transactions.find((t) => t.id === transactionId)
    if (!transaction) {
      throw new Error("Transaction not found")
    }

    if (transaction.status !== "completed") {
      throw new Error("Cannot refund non-completed transaction")
    }

    transaction.status = "refunded"
    transaction.refundAmount = amount
    transaction.refundReason = reason
    transaction.updatedAt = new Date()

    return transaction
  }

  static async getAnalytics(): Promise<PaymentAnalytics> {
    const completedTransactions = this.transactions.filter((t) => t.status === "completed")
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.netAmount, 0)
    const totalTransactions = this.transactions.length
    const successRate = totalTransactions > 0 ? (completedTransactions.length / totalTransactions) * 100 : 0
    const averageTransactionValue = completedTransactions.length > 0 ? totalRevenue / completedTransactions.length : 0

    // Calculate top payment methods
    const methodCounts = completedTransactions.reduce(
      (acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topPaymentMethods = Object.entries(methodCounts)
      .map(([method, count]) => ({
        method,
        count,
        percentage: (count / completedTransactions.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Generate monthly trends (last 6 months)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      // Simulate monthly data
      const monthlyTransactions = Math.floor(Math.random() * 100) + 50
      const monthlyRevenue = monthlyTransactions * (Math.random() * 1000 + 500)

      return {
        month: monthName,
        revenue: monthlyRevenue,
        transactions: monthlyTransactions,
      }
    }).reverse()

    return {
      totalRevenue,
      totalTransactions,
      successRate,
      averageTransactionValue,
      topPaymentMethods,
      monthlyTrends,
      recentTransactions: this.transactions.slice(-10).reverse(),
    }
  }

  static calculateProcessingFee(amount: number, paymentMethodId: string): number {
    const method = this.paymentMethods.find((m) => m.id === paymentMethodId)
    return method ? (amount * method.processingFee) / 100 : 0
  }

  static async validatePaymentMethod(paymentMethodId: string, currency: string): Promise<boolean> {
    const method = this.paymentMethods.find((m) => m.id === paymentMethodId)
    return method ? method.enabled && method.supportedCurrencies.includes(currency) : false
  }
}
