import type { CreateCheckoutInput, PaymentProvider } from "./types.js";

class BaseMockProvider implements PaymentProvider {
  key: "stripe" | "jazzcash" | "easypaisa";

  constructor(key: "stripe" | "jazzcash" | "easypaisa") {
    this.key = key;
  }

  async createCheckoutSession(input: CreateCheckoutInput) {
    return {
      provider: this.key,
      reference: `${this.key}-${input.orderId}`,
      checkoutUrl: `https://checkout.example.com/${this.key}?orderId=${input.orderId}`
    };
  }
}

export const providerRegistry: Record<string, PaymentProvider> = {
  stripe: new BaseMockProvider("stripe"),
  jazzcash: new BaseMockProvider("jazzcash"),
  easypaisa: new BaseMockProvider("easypaisa")
};
