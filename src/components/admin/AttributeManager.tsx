import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

// Attribute type definition
export interface AttributeItem {
  id: string;
  key: string;
  value: string | number | boolean;
  type: "string" | "number" | "boolean";
}

interface AttributeManagerProps {
  attributes: AttributeItem[];
  onChange: (attributes: AttributeItem[]) => void;
  disabled?: boolean;
}

// Generate unique ID
const generateId = () => `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function AttributeManager({ 
  attributes, 
  onChange,
  disabled = false 
}: AttributeManagerProps) {
  // Add new attribute
  const addAttribute = () => {
    const newAttribute: AttributeItem = {
      id: generateId(),
      key: "",
      value: "",
      type: "string",
    };
    onChange([...attributes, newAttribute]);
  };

  // Remove attribute
  const removeAttribute = (id: string) => {
    onChange(attributes.filter((attr) => attr.id !== id));
  };

  // Update attribute field
  const updateAttribute = (id: string, field: keyof AttributeItem, value: unknown) => {
    onChange(
      attributes.map((attr) => {
        if (attr.id === id) {
          // Type conversion based on type field
          if (field === "value" && attr.type === "number") {
            return { ...attr, [field]: Number(value) };
          } else if (field === "value" && attr.type === "boolean") {
            return { ...attr, [field]: value === "true" || value === true };
          }
          return { ...attr, [field]: value };
        }
        return attr;
      })
    );
  };

  // Handle type change (reset value when type changes)
  const handleTypeChange = (id: string, newType: "string" | "number" | "boolean") => {
    onChange(
      attributes.map((attr) => {
        if (attr.id === id) {
          // Reset value based on new type
          let defaultValue: string | number | boolean = "";
          if (newType === "number") defaultValue = 0;
          if (newType === "boolean") defaultValue = false;
          
          return { 
            ...attr, 
            type: newType,
            value: defaultValue
          };
        }
        return attr;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Atribut Produk</h3>
          <p className="text-sm text-gray-600 mt-1">
            Tambahkan atribut spesifik untuk produk ini (contoh: diameter, panjang, tipe, dll)
          </p>
        </div>
        <Button
          type="button"
          onClick={addAttribute}
          disabled={disabled}
          size="sm"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Atribut
        </Button>
      </div>

      {attributes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-500">
            Belum ada atribut. Klik tombol &ldquo;Tambah Atribut&rdquo; untuk menambahkan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {attributes.map((attr) => (
            <div
              key={attr.id}
              className="flex gap-3 items-start p-4 border rounded-lg bg-gray-50"
            >
              {/* Attribute Key */}
              <div className="flex-1">
                <Label htmlFor={`attr-key-${attr.id}`} className="text-xs text-gray-600 mb-1.5 block">
                  Nama Atribut *
                </Label>
                <Input
                  id={`attr-key-${attr.id}`}
                  placeholder="diameter_mm"
                  value={attr.key}
                  onChange={(e) => updateAttribute(attr.id, "key", e.target.value)}
                  disabled={disabled}
                  className="bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gunakan underscore untuk spasi (contoh: diameter_mm)
                </p>
              </div>

              {/* Type Selector */}
              <div className="w-32">
                <Label htmlFor={`attr-type-${attr.id}`} className="text-xs text-gray-600 mb-1.5 block">
                  Tipe *
                </Label>
                <Select
                  value={attr.type}
                  onValueChange={(value) => handleTypeChange(attr.id, value as "string" | "number" | "boolean")}
                  disabled={disabled}
                >
                  <SelectTrigger id={`attr-type-${attr.id}`} className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Value Input (Type-aware) */}
              <div className="flex-1">
                <Label htmlFor={`attr-value-${attr.id}`} className="text-xs text-gray-600 mb-1.5 block">
                  Nilai *
                </Label>
                {attr.type === "boolean" ? (
                  <Select
                    value={String(attr.value)}
                    onValueChange={(val) => updateAttribute(attr.id, "value", val === "true")}
                    disabled={disabled}
                  >
                    <SelectTrigger id={`attr-value-${attr.id}`} className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ya / True</SelectItem>
                      <SelectItem value="false">Tidak / False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`attr-value-${attr.id}`}
                    type={attr.type === "number" ? "number" : "text"}
                    placeholder={attr.type === "number" ? "32" : "AW"}
                    value={String(attr.value)}
                    onChange={(e) => updateAttribute(attr.id, "value", e.target.value)}
                    disabled={disabled}
                    className="bg-white"
                  />
                )}
              </div>

              {/* Remove Button */}
              <div className="pt-6">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeAttribute(attr.id)}
                  disabled={disabled}
                  title="Hapus atribut"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to convert AttributeItem[] to Record<string, any> for database
export function attributesToObject(attributes: AttributeItem[]): Record<string, unknown> {
  return attributes.reduce((acc, attr) => {
    if (attr.key.trim()) {
      acc[attr.key] = attr.value;
    }
    return acc;
  }, {} as Record<string, unknown>);
}

// Helper function to convert Record<string, any> to AttributeItem[] for form
export function objectToAttributes(obj: Record<string, unknown>): AttributeItem[] {
  return Object.entries(obj).map(([key, value]) => ({
    id: generateId(),
    key,
    value: value as string | number | boolean,
    type: (typeof value === "number" ? "number" : 
           typeof value === "boolean" ? "boolean" : 
           "string") as "string" | "number" | "boolean",
  }));
}
