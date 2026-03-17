// utils/calculatePrice.ts

export const calculateSilverPrice = (
  weight: number, 
  rate: number, 
  makingPercentage: number, 
  pricingType: string = 'calculated', // 👈 Naya (Optional)
  fixedPrice: number = 0              // 👈 Naya (Optional)
) => {
  
  // --- NAYA LOGIC: Agar product Fixed Rate wala hai ---
  if (pricingType === 'fixed') {
    if (!fixedPrice) return { finalPrice: 0, breakup: {} };

    const gstAmount = fixedPrice * 0.03;
    const finalPrice = Math.round(fixedPrice + gstAmount);

    return {
      finalPrice,
      breakup: {
        silverValue: Math.round(fixedPrice), // Frontend error se bachne ke liye fixed price ko hi silverValue me bhej rahe hain
        makingCost: 0, // Fixed me making charge 0
        gst: Math.round(gstAmount)
      }
    };
  }

  // --- PURANA LOGIC: (Bina kisi change ke) ---
  // Agar data missing hai to 0 return karein
  if (!weight || !rate) return { finalPrice: 0, breakup: {} };

  // 1. Silver Base Cost
  const silverValue = weight * rate;

  // 2. Making Charges (Percentage logic)
  const makingCost = silverValue * (makingPercentage / 100);

  // 3. Subtotal (Before GST)
  const subTotal = silverValue + makingCost;

  // 4. GST (3%)
  const gstAmount = subTotal * 0.03;

  // 5. Final Price (Round figure)
  const finalPrice = Math.round(subTotal + gstAmount);

  return {
    finalPrice,
    breakup: {
      silverValue: Math.round(silverValue),
      makingCost: Math.round(makingCost),
      gst: Math.round(gstAmount)
    }
  };
};