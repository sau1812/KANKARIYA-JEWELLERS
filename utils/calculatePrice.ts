// utils/calculatePrice.ts

export const calculateSilverPrice = (weight: number, rate: number, makingPercentage: number) => {
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