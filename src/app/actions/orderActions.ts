"use server";

import { calculateShipping, ShippingResult } from "@/lib/shipping";

/**
 * Server-side shipping validation.
 * Only the shipping calculation runs on the server to prevent client-side
 * tampering. The actual Firestore order write happens client-side where
 * Firebase Auth context is available.
 */
export async function validateShippingAction(
  pincode: string,
  selectedState: string
): Promise<{ valid: boolean; shipping: ShippingResult; error?: string }> {
  try {
    const shipping = await calculateShipping(pincode);

    if (!shipping.serviceable) {
      return { valid: false, shipping, error: shipping.error || "Delivery location is not serviceable." };
    }

    if (shipping.state && shipping.state.toLowerCase() !== selectedState.toLowerCase()) {
      return { valid: false, shipping, error: "The selected state does not match the PIN code." };
    }

    return { valid: true, shipping };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      valid: false,
      shipping: { serviceable: false, state: null, city: null, charge: null },
      error: "Could not validate shipping. Please try again.",
    };
  }
}
