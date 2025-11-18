import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";

// NO MORE HARDCODED unitConversions!
// Unit conversions now come from database via categoryUnits prop

interface CategoryUnitData {
  value: string;
  label: string;
  conversionRate: number;
}

interface CategoryUnits {
  availableUnits: CategoryUnitData[];
}

interface UnitConverterProps {
  category: string;
  productUnit: string;
  productPrice: number;
  productStock: number;
  availableUnits?: string[]; // Units dari database yang dipilih admin (deprecated, now use categoryUnits)
  categoryUnits?: CategoryUnits; // ⭐ NEW: Full unit data from database
  productAttributes?: Record<string, string | number>; // Attributes dari database (untuk ambil weight_kg)
  onAddToCart?: (quantity: number, unit: string, totalPrice: number) => void;
}

export default function UnitConverter({
  category,
  productUnit,
  productPrice,
  productStock,
  availableUnits, // Legacy prop (kept for backward compatibility)
  categoryUnits, // ⭐ NEW: Database-driven units
  productAttributes,
  onAddToCart,
}: UnitConverterProps) {
  // FROM unit LOCKED to supplier's unit (productUnit)
  const fromUnit = productUnit.toLowerCase();

  // TO unit can be changed by customer (default to first available unit)
  const [toUnit, setToUnit] = useState<string>("");
  
  // User inputs the desired quantity in the TARGET unit ("Ke"). Keep as string for controlled input.
  const [toValue, setToValue] = useState<string>("1");

  // If no category units provided, can't show converter
  if (!categoryUnits || !categoryUnits.availableUnits || categoryUnits.availableUnits.length === 0) {
    return null;
  }

  const { availableUnits: unitsFromDB } = categoryUnits;

  // Use database units (no hardcoded conversions)
  let dynamicConversions = unitsFromDB;

  // Special handling for Besi and Kawat with dynamic weight
  if (category === "Besi" && productAttributes?.weight_kg) {
    const weightKg = Number(productAttributes.weight_kg);
    const lengthMeter = Number(productAttributes.length_meter) || 12;
    
    // Update labels dynamically based on actual weight
    dynamicConversions = unitsFromDB.map((unit) => {
      if (unit.value === "batang") {
        return { ...unit, label: `Batang (${weightKg}kg)` };
      } else if (unit.value === "lonjor") {
        return {
          ...unit,
          label: `Lonjor (${lengthMeter}m)`,
          conversionRate: weightKg * (lengthMeter / 12),
        };
      }
      return unit;
    });
  } else if (category === "Kawat" && productAttributes?.weight_kg) {
    const weightKg = Number(productAttributes.weight_kg);
    
    // Update gulung label dynamically
    dynamicConversions = unitsFromDB.map((unit) => {
      if (unit.value === "gulung") {
        return { ...unit, label: `Gulung (${weightKg}kg)` };
      }
      return unit;
    });
  }

  // Filter conversions based on availableUnits from admin selection
  const allowedConversions = dynamicConversions.filter(
    (conv) => !availableUnits || availableUnits.length === 0 || availableUnits.includes(conv.value)
  );

  // Set default toUnit if not set yet
  if (!toUnit && allowedConversions.length > 0) {
    const defaultUnit = allowedConversions.find((c) => c.value !== fromUnit)?.value || 
                       allowedConversions[0]?.value || 
                       "";
    setToUnit(defaultUnit);
  }

  // Jika tidak ada unit yang diizinkan atau hanya ada 1 unit yang sama dengan supplier unit, tidak tampilkan converter
  if (allowedConversions.length === 0 || 
     (allowedConversions.length === 1 && allowedConversions[0].value === fromUnit)) {
    return null;
  }

  // Fungsi konversi menggunakan conversionRate dari database
  const convertUnits = (value: number, from: string, to: string): number => {
    const fromConversion = dynamicConversions.find((c) => c.value === from);
    const toConversion = dynamicConversions.find((c) => c.value === to);

    if (!fromConversion || !toConversion) return 0;

    // Konversi ke base unit dulu, lalu ke target unit
    // Formula: value * fromRate / toRate
    // Contoh: 2 sak → kg → ton
    // 2 * 50 (sak→kg) / 1000 (ton→kg) = 0.1 ton
    const baseValue = value * fromConversion.conversionRate;
    const result = baseValue / toConversion.conversionRate;

    return result;
  };

  const toValueNum = parseFloat(toValue) || 0;

  // Convert the user-entered 'to' quantity back to supplier's unit to compute price/stock/cart
  const quantityInProductUnit = convertUnits(toValueNum, toUnit, fromUnit);

  // Calculate price based on supplier unit
  const totalPrice = quantityInProductUnit * productPrice;

  // Calculate how much of the 'to' unit is available given productStock in supplier unit
  const availableInToUnit = convertUnits(productStock, fromUnit, toUnit);

  const isOutOfStock = quantityInProductUnit > productStock || toValueNum <= 0;

  const handleAddToCart = () => {
    if (onAddToCart && !isOutOfStock && toValueNum > 0) {
      // Pass quantity and unit that user selected (NOT converted to supplier unit)
      onAddToCart(toValueNum, toUnit, totalPrice);
    }
  };

  // Get the label for supplier's unit
  const supplierUnitLabel = allowedConversions.find(c => c.value === fromUnit)?.label || productUnit;

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Beli Dalam Satuan Lain</h3>
        <span className="text-sm text-green-600">
          Stok: {productStock} {supplierUnitLabel}
        </span>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            value={toValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d*\.?\d*$/.test(v)) setToValue(v);
            }}
            className="flex-1"
            placeholder="Jumlah"
          />
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedConversions.map((conversion) => (
                <SelectItem key={conversion.value} value={conversion.value}>
                  {conversion.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info when value entered */}
        {toValueNum > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Konversi:</span>
              <span className="font-medium">
                {toValueNum} {allowedConversions.find(c => c.value === toUnit)?.label} = {quantityInProductUnit.toFixed(2)} {supplierUnitLabel}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-primary">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalPrice)}
              </span>
            </div>
            {isOutOfStock && (
              <p className="text-xs text-red-600">
                Stok tidak cukup. Maksimal: {availableInToUnit.toFixed(2)} {allowedConversions.find(c => c.value === toUnit)?.label}
              </p>
            )}
          </div>
        )}

        {/* Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || toValueNum <= 0}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock 
            ? "Stok Tidak Cukup" 
            : toValueNum <= 0 
            ? "Masukkan Jumlah" 
            : `Beli ${quantityInProductUnit.toFixed(2)} ${supplierUnitLabel}`
          }
        </Button>
      </div>
    </Card>
  );
}
