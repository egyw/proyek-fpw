/**
 * Shipping Weight Calculation Helpers
 * 
 * Handles weight calculation for products with multi-unit system.
 * Weight is stored in product.attributes.weight_kg (per supplier's unit).
 * If not available, uses category-based defaults.
 */

import type { CartItem } from '@/store/cartStore';

/**
 * Category-based default weights (in kg per supplier unit)
 * Used when product.attributes.weight_kg is not available
 */
const CATEGORY_DEFAULT_WEIGHTS: Record<string, number> = {
  Semen: 50,      // 1 sak = 50kg (standard)
  Besi: 7.4,      // 1 batang 10mm = 7.4kg (average)
  Pipa: 2,        // 1 batang PVC = 2kg (average)
  Triplek: 10,    // 1 lembar = 10kg (average)
  'Tangki Air': 5, // Empty tank = 5kg (average)
  Kawat: 25,      // 1 gulung = 25kg (average)
  Paku: 1,        // Per kg/set
  Baut: 1,        // Per kg/set
  Aspal: 1,       // Per liter ≈ 1kg
};

/**
 * Unit conversion to base unit (kg)
 * Used to convert customer's selected unit back to kg for shipping
 */
const UNIT_TO_KG_CONVERSION: Record<string, Record<string, number>> = {
  Semen: {
    sak: 50,      // 1 sak = 50kg
    kg: 1,        // 1 kg = 1kg
    zak: 40,      // 1 zak = 40kg
    ton: 1000,    // 1 ton = 1000kg
  },
  Besi: {
    batang: 7.4,  // Default, will be overridden by product.attributes.weight_kg
    kg: 1,
    ton: 1000,
  },
  Pipa: {
    batang: 2,    // Default, will be overridden by product.attributes.weight_kg
    meter: 0.5,   // Approximate
    pcs: 2,
  },
  Triplek: {
    lembar: 10,   // Default
    kg: 1,
  },
  'Tangki Air': {
    unit: 5,      // Empty tank
    pcs: 5,
  },
  Kawat: {
    gulung: 25,   // Default, will be overridden by product.attributes.weight_kg
    kg: 1,
  },
  Paku: {
    kg: 1,
    pcs: 0.01,    // 1 paku ≈ 10g
  },
  Baut: {
    kg: 1,
    pcs: 0.02,    // 1 baut ≈ 20g
    set: 0.5,     // 1 set ≈ 500g
  },
  Aspal: {
    liter: 1,     // 1 liter ≈ 1kg
    galon: 20,    // 1 galon = 20 liter
  },
};

/**
 * Get product weight in kg (per supplier's unit)
 * Priority: product.attributes.weight_kg > category default
 */
export function getProductWeightPerUnit(
  category: string,
  attributes?: Record<string, string | number | boolean>
): number {
  // Check if product has weight_kg in attributes
  if (attributes?.weight_kg && typeof attributes.weight_kg === 'number') {
    return attributes.weight_kg;
  }

  // Fallback to category default
  return CATEGORY_DEFAULT_WEIGHTS[category] || 1; // Default 1kg if unknown
}

/**
 * Calculate total weight for a cart item (in grams for RajaOngkir API)
 * 
 * CRITICAL LOGIC:
 * - product.attributes.weight_kg = Weight per SUPPLIER'S UNIT (e.g., 1 sak = 50kg, 1 batang = 7.4kg)
 * - item.unit = Customer's selected unit (e.g., customer bought in "kg" or "sak")
 * - We need to convert customer's quantity to actual weight in kg, then to grams
 * 
 * Example 1 (Simple - Weight Unit):
 * - Product: Semen (supplier unit: SAK, weight_kg: 50)
 * - Customer buys: 2 KG (not sak!)
 * - Logic: Customer bought WEIGHT directly, no conversion needed
 * - Calculation: 2 kg × 1000 = 2000 grams ✅
 * 
 * Example 2 (Conversion - Supplier Unit):
 * - Product: Semen (supplier unit: SAK, weight_kg: 50)
 * - Customer buys: 2 SAK (supplier's unit)
 * - Logic: 1 SAK = 50kg, so 2 SAK = 100kg
 * - Calculation: 2 × 50kg × 1000 = 100,000 grams ✅
 * 
 * Example 3 (Dynamic Weight - Besi):
 * - Product: Besi 10mm (supplier unit: BATANG, weight_kg: 7.4)
 * - Customer buys: 3 BATANG
 * - Calculation: 3 × 7.4kg × 1000 = 22,200 grams ✅
 * 
 * Example 4 (Fractional Quantity):
 * - Product: Pipa (supplier unit: BATANG, weight_kg: 2)
 * - Customer buys: 0.5 METER (half batang via conversion)
 * - Calculation: 0.5 × 2kg × 1000 = 1000 grams ✅
 */
export function calculateCartItemWeight(
  item: CartItem,
  productAttributes?: Record<string, string | number | boolean>
): number {
  const category = item.category;
  const selectedUnit = item.unit.toLowerCase(); // Normalize
  const quantity = item.quantity;

  // Get base weight per supplier's unit from product attributes or category default
  const baseWeightKg = getProductWeightPerUnit(category, productAttributes);

  // Get conversion map for this category
  const categoryConversions = UNIT_TO_KG_CONVERSION[category] || {};
  
  // Calculate weight based on selected unit
  let weightInKg: number;
  
  // Check if conversion exists for selected unit
  if (categoryConversions[selectedUnit] !== undefined) {
    const conversionValue = categoryConversions[selectedUnit];
    
    // CRITICAL DISTINCTION:
    // If conversion value is 1 → It's a pure WEIGHT unit (kg, liter)
    // Customer bought weight directly, no need for base weight multiplication
    if (selectedUnit === 'kg' || conversionValue === 1) {
      // Customer bought in KG directly
      weightInKg = quantity * 1; // 2 kg = 2 kg
    } else if (selectedUnit === 'ton') {
      // Customer bought in TON
      weightInKg = quantity * 1000; // 0.5 ton = 500 kg
    } else {
      // Customer bought in QUANTITY unit (sak, batang, lembar, gulung, etc.)
      // Use base weight from product (per supplier's unit)
      // Example: 2 sak × 50kg/sak = 100kg
      weightInKg = quantity * baseWeightKg;
    }
  } else {
    // No conversion found - assume it's supplier's unit (batang, sak, etc.)
    // Use base weight directly
    weightInKg = quantity * baseWeightKg;
  }

  // Convert to grams for RajaOngkir API
  const totalWeightGrams = weightInKg * 1000;

  return Math.round(totalWeightGrams); // Round to avoid floating point issues
}

/**
 * Calculate total weight for entire cart (in grams)
 * Used by ShippingCalculator component
 * 
 * @param cartItems - Array of cart items
 * @param productsAttributes - Optional map of productId to attributes (for accurate weights)
 * @returns Total weight in grams
 */
export function calculateCartTotalWeight(
  cartItems: CartItem[],
  productsAttributes?: Record<string, Record<string, string | number | boolean>>
): number {
  return cartItems.reduce((total, item) => {
    const attributes = productsAttributes?.[item.productId];
    const itemWeight = calculateCartItemWeight(item, attributes);
    return total + itemWeight;
  }, 0);
}

/**
 * Format weight for display (convert grams to kg/ton)
 * 
 * @param weightGrams - Weight in grams
 * @returns Formatted string (e.g., "2.5 kg", "1.2 ton")
 */
export function formatWeight(weightGrams: number): string {
  const weightKg = weightGrams / 1000;
  
  if (weightKg >= 1000) {
    const weightTon = weightKg / 1000;
    return `${weightTon.toFixed(2)} ton`;
  }
  
  if (weightKg >= 1) {
    return `${weightKg.toFixed(2)} kg`;
  }
  
  return `${weightGrams.toFixed(0)} gram`;
}
