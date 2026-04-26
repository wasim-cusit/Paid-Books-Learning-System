export type PaymentProviderKey = "stripe" | "jazzcash" | "easypaisa";

export type CreateCheckoutInput = {
  provider: PaymentProviderKey;
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
};

export type CheckoutSession = {
  provider: PaymentProviderKey;
  checkoutUrl: string;
  reference: string;
};

export interface PaymentProvider {
  key: PaymentProviderKey;
  createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession>;
}
