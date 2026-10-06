export const DELIVERY_ZONES: Record<string, number> = {
  "Delhi": 0,
  "Uttar Pradesh": 99,
  "Haryana": 149,
  "Punjab": 149,
};

export type ShippingResult = {
  serviceable: boolean;
  state: string | null;
  city: string | null;
  charge: number | null;
  error?: string;
};

/**
 * Fetches the Indian State and City for a given 6-digit PIN code using the Postal PIN Code API.
 */
export async function fetchPincodeState(pincode: string): Promise<{ state: string; city: string } | null> {
  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    const data = await res.json();
    if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      return { state: po.State, city: po.District || po.Region || po.Block };
    }
  } catch (err) {
    console.error("Error fetching PIN code:", err);
  }
  return null;
}

/**
 * Calculates the shipping serviceability and charge based on a PIN code.
 */
export async function calculateShipping(pincode: string): Promise<ShippingResult> {
  const result = await fetchPincodeState(pincode);

  if (!result) {
    return {
      serviceable: false,
      state: null,
      city: null,
      charge: null,
      error: "Please enter a valid delivery PIN code.",
    };
  }

  const { state, city } = result;

  if (state in DELIVERY_ZONES) {
    return {
      serviceable: true,
      state,
      city,
      charge: DELIVERY_ZONES[state],
    };
  }

  return {
    serviceable: false,
    state,
    city,
    charge: null,
    error: "Sorry, we currently deliver only to Delhi, Haryana, Punjab and Uttar Pradesh.",
  };
}
