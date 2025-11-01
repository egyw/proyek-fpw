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

interface UnitConversion {
  unit: string;
  toBase: number; // Konversi ke unit dasar (base unit)
  label: string;
}

interface CategoryUnits {
  baseUnit: string;
  conversions: UnitConversion[];
}

// Definisi konversi untuk setiap kategori produk
const unitConversions: Record<string, CategoryUnits> = {
  Semen: {
    baseUnit: "kg",
    conversions: [
      { unit: "sak", toBase: 50, label: "Sak (50kg)" },
      { unit: "kg", toBase: 1, label: "Kilogram (kg)" },
      { unit: "zak", toBase: 40, label: "Zak (40kg)" },
      { unit: "ton", toBase: 1000, label: "Ton (1000kg)" },
    ],
  },
  Keramik: {
    baseUnit: "pcs",
    conversions: [
      { unit: "dus", toBase: 11, label: "Dus (11 pcs)" },
      { unit: "pcs", toBase: 1, label: "Pieces (pcs)" },
      { unit: "m2", toBase: 0.99, label: "Meter Persegi (m²)" },
      { unit: "box", toBase: 6, label: "Box (6 pcs)" },
    ],
  },
  Cat: {
    baseUnit: "liter",
    conversions: [
      { unit: "kaleng", toBase: 5, label: "Kaleng (5 liter)" },
      { unit: "liter", toBase: 1, label: "Liter (L)" },
      { unit: "galon", toBase: 20, label: "Galon (20 liter)" },
      { unit: "kg", toBase: 1.2, label: "Kilogram (kg)" },
    ],
  },
  Besi: {
    baseUnit: "kg",
    conversions: [
      { unit: "batang", toBase: 7.4, label: "Batang (7.4kg)" },
      { unit: "kg", toBase: 1, label: "Kilogram (kg)" },
      { unit: "ton", toBase: 1000, label: "Ton (1000kg)" },
      { unit: "lonjor", toBase: 88.8, label: "Lonjor (12m)" },
    ],
  },
  Pipa: {
    baseUnit: "batang",
    conversions: [
      { unit: "batang", toBase: 1, label: "Batang (4m)" },
      { unit: "meter", toBase: 0.25, label: "Meter (m)" },
      { unit: "pcs", toBase: 1, label: "Pieces (pcs)" },
    ],
  },
  Kayu: {
    baseUnit: "lembar",
    conversions: [
      { unit: "lembar", toBase: 1, label: "Lembar" },
      { unit: "pcs", toBase: 1, label: "Pieces (pcs)" },
      { unit: "m3", toBase: 0.029, label: "Meter Kubik (m³)" },
    ],
  },
  Atap: {
    baseUnit: "lembar",
    conversions: [
      { unit: "lembar", toBase: 1, label: "Lembar" },
      { unit: "pcs", toBase: 1, label: "Pieces (pcs)" },
      { unit: "m2", toBase: 0.8, label: "Meter Persegi (m²)" },
    ],
  },
};

interface UnitConverterProps {
  category: string;
  productUnit: string;
  productPrice: number;
  productStock: number;
  availableUnits?: string[]; // Units dari database yang dipilih admin
  onAddToCart?: (quantity: number, unit: string, totalPrice: number) => void;
}

export default function UnitConverter({
  category,
  productUnit,
  productPrice,
  productStock,
  availableUnits,
  onAddToCart,
}: UnitConverterProps) {
  const categoryUnits = unitConversions[category];

  // Filter conversions berdasarkan availableUnits dari database
  const allowedConversions = categoryUnits?.conversions.filter(
    (conv) => !availableUnits || availableUnits.includes(conv.unit)
  ) || [];

  // FROM unit LOCKED to supplier's unit (productUnit)
  const fromUnit = productUnit.toLowerCase();

  // TO unit can be changed by customer (default to first available unit that's different from supplier unit)
  const [toUnit, setToUnit] = useState(
    allowedConversions.find((c) => c.unit !== fromUnit)?.unit || 
    allowedConversions[0]?.unit || 
    ""
  );
  // User inputs the desired quantity in the TARGET unit ("Ke"). Keep as string for controlled input.
  const [toValue, setToValue] = useState<string>("1");

  // Jika kategori tidak ada konversi atau tidak ada unit yang diizinkan, tidak tampilkan converter
  if (!categoryUnits || allowedConversions.length === 0) {
    return null;
  }

  // Fungsi konversi
  const convertUnits = (value: number, from: string, to: string): number => {
    const fromConversion = categoryUnits.conversions.find((c) => c.unit === from);
    const toConversion = categoryUnits.conversions.find((c) => c.unit === to);

    if (!fromConversion || !toConversion) return 0;

    // Konversi ke base unit dulu, lalu ke target unit
    const baseValue = value * fromConversion.toBase;
    const result = baseValue / toConversion.toBase;

    return result;
  };

  // No editable "from" input: users enter quantity in the TARGET unit (toValue)

  const toValueNum = parseFloat(toValue) || 0;

  // Convert the user-entered 'to' quantity back to supplier's unit to compute price/stock/cart
  // e.g. user inputs 0.1 (ton) -> convertUnits(0.1, 'ton', 'sak') => qty in sak
  const quantityInProductUnit = convertUnits(toValueNum, toUnit, fromUnit);

  // Calculate price based on supplier unit
  const totalPrice = quantityInProductUnit * productPrice;

  // Calculate how much of the 'to' unit is available given productStock in supplier unit
  const availableInToUnit = convertUnits(productStock, fromUnit, toUnit);

  const isOutOfStock = quantityInProductUnit > productStock || toValueNum <= 0;

  const handleAddToCart = () => {
    if (onAddToCart && !isOutOfStock && toValueNum > 0) {
      // Pass quantity in supplier unit to cart handler
      onAddToCart(quantityInProductUnit, fromUnit, totalPrice);
    }
  };

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Beli Dalam Satuan Lain</h3>
        <span className="text-sm text-green-600">
          Stok: {productStock} {allowedConversions.find(c => c.unit === fromUnit)?.label}
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
                <SelectItem key={conversion.unit} value={conversion.unit}>
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
                {toValueNum} {allowedConversions.find(c => c.unit === toUnit)?.label} = {quantityInProductUnit.toFixed(2)} {allowedConversions.find(c => c.unit === fromUnit)?.label}
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
                Stok tidak cukup. Maksimal: {availableInToUnit.toFixed(2)} {allowedConversions.find(c => c.unit === toUnit)?.label}
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
            : `Beli ${toValueNum} ${allowedConversions.find(c => c.unit === toUnit)?.label}`
          }
        </Button>
      </div>
    </Card>
  );
}
