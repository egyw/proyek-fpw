import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Calculator, ShoppingCart, Info } from "lucide-react";

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
  onAddToCart?: (quantity: number, unit: string, totalPrice: number) => void;
}

export default function UnitConverter({
  category,
  productUnit,
  productPrice,
  productStock,
  onAddToCart,
}: UnitConverterProps) {
  const categoryUnits = unitConversions[category];

  const [fromUnit, setFromUnit] = useState(productUnit.toLowerCase());
  const [toUnit, setToUnit] = useState(
    categoryUnits?.conversions.find((c) => c.unit !== productUnit.toLowerCase())
      ?.unit || categoryUnits?.baseUnit || ""
  );
  const [fromValue, setFromValue] = useState<string>("1");

  // Jika kategori tidak ada konversi, tidak tampilkan converter
  if (!categoryUnits) {
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

  const handleFromValueChange = (value: string) => {
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromValue(value);
    }
  };

  const fromValueNum = parseFloat(fromValue) || 0;
  const toValue = convertUnits(fromValueNum, fromUnit, toUnit);

  // Calculate price based on converted unit
  const calculatePrice = (): number => {
    // Convert back to product's original unit to calculate price
    const quantityInProductUnit = convertUnits(fromValueNum, fromUnit, productUnit.toLowerCase());
    return quantityInProductUnit * productPrice;
  };

  // Calculate available stock in selected unit
  const availableInSelectedUnit = convertUnits(productStock, productUnit.toLowerCase(), fromUnit);

  const totalPrice = calculatePrice();
  const isOutOfStock = fromValueNum > availableInSelectedUnit;

  const handleAddToCart = () => {
    if (onAddToCart && !isOutOfStock && fromValueNum > 0) {
      onAddToCart(fromValueNum, fromUnit, totalPrice);
    }
  };

  return (
    <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Kalkulator & Pembelian Custom Unit</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Info className="h-4 w-4" />
          <span>Beli dalam unit yang Anda inginkan</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From Unit */}
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Dari</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={fromValue}
              onChange={(e) => handleFromValueChange(e.target.value)}
              className="flex-1"
              placeholder="0"
            />
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryUnits.conversions.map((conversion) => (
                  <SelectItem key={conversion.unit} value={conversion.unit}>
                    {conversion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* To Unit */}
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Ke</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={toValue.toFixed(2)}
              readOnly
              className="flex-1 bg-white font-semibold"
            />
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryUnits.conversions.map((conversion) => (
                  <SelectItem key={conversion.unit} value={conversion.unit}>
                    {conversion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Quick Info & Actions */}
      <div className="mt-4 pt-4 border-t border-primary/20 space-y-3">
        {/* Conversion Result */}
        <p className="text-xs text-gray-600">
          <span className="font-semibold">{fromValueNum} {categoryUnits.conversions.find(c => c.unit === fromUnit)?.label}</span> = <span className="font-semibold text-primary">{toValue.toFixed(2)} {categoryUnits.conversions.find(c => c.unit === toUnit)?.label}</span>
        </p>

        {/* Price & Stock Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Harga</p>
            <p className="text-lg font-bold text-primary">
              Rp {totalPrice.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Stok Tersedia</p>
            <p className={`text-sm font-semibold ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
              {availableInSelectedUnit.toFixed(2)} {categoryUnits.conversions.find(c => c.unit === fromUnit)?.label}
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || fromValueNum <= 0}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isOutOfStock 
            ? "Stok Tidak Cukup" 
            : fromValueNum <= 0 
            ? "Masukkan Jumlah" 
            : `Beli ${fromValueNum} ${categoryUnits.conversions.find(c => c.unit === fromUnit)?.label}`
          }
        </Button>
      </div>
    </Card>
  );
}
