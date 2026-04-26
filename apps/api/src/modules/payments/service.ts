import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { providerRegistry } from "./providers.js";
import type { CreateCheckoutInput, PaymentProviderKey } from "./types.js";

const inputSchema = z.object({
  provider: z.enum(["stripe", "jazzcash", "easypaisa"]),
  orderId: z.string().min(3),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  customerEmail: z.string().email()
});

export async function createCheckoutSession(raw: unknown) {
  const input = inputSchema.parse(raw) as CreateCheckoutInput;
  const provider = providerRegistry[input.provider as PaymentProviderKey];

  if (!provider) {
    throw new Error(`Unsupported payment provider: ${input.provider}`);
  }

  return provider.createCheckoutSession(input);
}

const startPurchaseSchema = z.object({
  provider: z.enum(["stripe", "jazzcash", "easypaisa"]),
  courseId: z.string().min(3),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3)
});

export async function startPurchase(userId: string, userEmail: string, raw: unknown) {
  const input = startPurchaseSchema.parse(raw);
  const provider = providerRegistry[input.provider as PaymentProviderKey];
  if (!provider) {
    throw new Error(`Unsupported payment provider: ${input.provider}`);
  }

  const purchase = await prisma.purchase.create({
    data: {
      userId,
      courseId: input.courseId,
      amount: input.amount,
      currency: input.currency.toUpperCase(),
      provider: input.provider
    }
  });

  const session = await provider.createCheckoutSession({
    provider: input.provider,
    orderId: purchase.id,
    amount: input.amount,
    currency: input.currency.toUpperCase(),
    customerEmail: userEmail
  });

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { providerRef: session.reference }
  });

  return {
    purchaseId: purchase.id,
    session
  };
}
