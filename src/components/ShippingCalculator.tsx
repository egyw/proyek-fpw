import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Truck, Package, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface ShippingOption {
  courier: string;
  courierName: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

interface ShippingCalculatorProps {
  destinationCity: string; // City name from user address (e.g., "Yogyakarta")
  destinationCityId?: string; // Optional: RajaOngkir city ID (skip search if provided)
  destinationCountry?: string; // Country name (default: "Indonesia")
  cartWeight: number; // Total weight in grams
  onSelectShipping: (option: ShippingOption) => void;
  selectedShipping?: ShippingOption;
  rajaOngkirPlan?: 'free' | 'all'; // RajaOngkir plan (free = 3 kurir, all = 11 kurir)
}

export default function ShippingCalculator({
  destinationCity,
  destinationCityId: propDestinationCityId, // Get from prop if available
  destinationCountry = 'Indonesia',
  cartWeight,
  onSelectShipping,
  selectedShipping,
  rajaOngkirPlan = 'free',
}: ShippingCalculatorProps) {
  const [destinationCityId, setDestinationCityId] = useState<string>(propDestinationCityId || '');
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedCouriers, setExpandedCouriers] = useState<Set<string>>(new Set());

  // Get store configuration from database
  const { data: storeConfig } = trpc.store.getConfig.useQuery();
  
  // Use store's city ID as origin (from database)
  const STORE_CITY_ID = storeConfig?.storeCityId || '501'; // Fallback to Yogyakarta if not loaded

  // Check if destination is international
  const isInternationalDestination = 
    destinationCountry.toLowerCase() !== 'indonesia';

  // Search city to get city ID from city name
  const { data: citySearchResult, refetch: searchCityRefetch } =
    trpc.shipping.searchCity.useQuery(
      { cityName: destinationCity },
      { enabled: false } // Manual trigger
    );

  // Get all shipping options
  const { data: shippingOptions, isLoading: isLoadingOptions, error: shippingError } =
    trpc.shipping.getAllShippingOptions.useQuery(
      {
        origin: STORE_CITY_ID,
        destination: destinationCityId,
        weight: cartWeight,
        isInternational: isInternationalDestination,
        plan: rajaOngkirPlan,
      },
      {
        enabled: !!destinationCityId && cartWeight > 0, // Only fetch if we have city ID and weight
      }
    );

  // Auto-search city when destinationCity changes (only if city ID not provided)
  useEffect(() => {
    // Skip search if city ID already provided via prop
    if (propDestinationCityId) {
      setDestinationCityId(propDestinationCityId);
      setIsCalculating(false);
      return;
    }

    // For international, set dummy city ID (RajaOngkir will handle international)
    if (isInternationalDestination) {
      setDestinationCityId('international');
      setIsCalculating(false);
      return;
    }

    // Only search if domestic and no city ID provided
    if (!isInternationalDestination && destinationCity && destinationCity.length >= 3) {
      setIsCalculating(true);
      searchCityRefetch();
    }
  }, [destinationCity, propDestinationCityId, isInternationalDestination, searchCityRefetch]);

  // Set city ID when search results come back
  useEffect(() => {
    if (citySearchResult?.cities && citySearchResult.cities.length > 0) {
      // Take first match (you can improve this with better matching logic)
      setDestinationCityId(citySearchResult.cities[0].city_id);
      setIsCalculating(false);
    }
  }, [citySearchResult]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format weight
  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} kg`;
    }
    return `${grams} gram`;
  };

  if (isCalculating) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-4 text-gray-600">Mencari kota tujuan...</p>
        </div>
      </Card>
    );
  }

  if (!destinationCityId) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {isInternationalDestination 
              ? 'Pengiriman internasional akan menggunakan JNE, TIKI, atau POS Indonesia'
              : 'Masukkan alamat lengkap untuk menghitung ongkir'
            }
          </p>
          {isInternationalDestination && (
            <p className="text-sm text-gray-500 mt-2">
              Hanya JNE, TIKI, dan POS Indonesia yang support pengiriman internasional
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (isLoadingOptions) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-4 text-gray-600">Menghitung ongkir...</p>
        </div>
      </Card>
    );
  }

  // Show error if API failed (e.g., API key issue)
  if (shippingError) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <Truck className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="font-semibold text-red-800 mb-2">
              Gagal Menghitung Ongkir
            </p>
            <p className="text-sm text-red-600 mb-4">
              {shippingError.message || 'Terjadi kesalahan saat menghubungi API RajaOngkir'}
            </p>
            {shippingError.message?.includes('410') && (
              <div className="text-xs text-red-700 bg-red-100 p-3 rounded">
                <p className="font-medium mb-2">🔧 Cara Memperbaiki:</p>
                <ol className="text-left space-y-1 ml-4">
                  <li>1. Login ke https://rajaongkir.com/panel/dashboard</li>
                  <li>2. Cek status account dan quota</li>
                  <li>3. Generate API key baru jika diperlukan</li>
                  <li>4. Update RAJAONGKIR_API_KEY di .env.local</li>
                  <li>5. Restart server (npm run dev)</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (!shippingOptions?.options || shippingOptions.options.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Tidak ada layanan pengiriman tersedia untuk alamat ini
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informasi Pengiriman</p>
            <p>Berat total: {formatWeight(cartWeight)}</p>
            <p>Tujuan: {destinationCity}, {destinationCountry}</p>
            {isInternationalDestination && (
              <p className="mt-2 text-xs text-blue-600 font-medium">
                🌍 Pengiriman Internasional - Kurir tersedia: JNE, TIKI, POS Indonesia
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Shipping Options - Grouped by Courier */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Pilih Layanan Pengiriman</Label>

        {(() => {
          // Group options by courier
          const groupedOptions = shippingOptions.options.reduce((acc, option) => {
            const courier = option.courier;
            if (!acc[courier]) {
              acc[courier] = {
                courierCode: courier,
                courierName: option.courierName,
                services: []
              };
            }
            acc[courier].services.push(option);
            return acc;
          }, {} as Record<string, { courierCode: string; courierName: string; services: typeof shippingOptions.options }>);

          const toggleCourier = (courierCode: string) => {
            const newExpanded = new Set(expandedCouriers);
            if (newExpanded.has(courierCode)) {
              newExpanded.delete(courierCode);
            } else {
              newExpanded.add(courierCode);
            }
            setExpandedCouriers(newExpanded);
          };

          return Object.values(groupedOptions).map((group) => {
            const isExpanded = expandedCouriers.has(group.courierCode);
            const hasSelectedService = group.services.some(
              (s) => selectedShipping?.courier === s.courier && selectedShipping?.service === s.service
            );

            return (
              <Card key={group.courierCode} className="overflow-hidden">
                {/* Courier Header - Clickable to expand/collapse */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                  onClick={() => toggleCourier(group.courierCode)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {group.courierName.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {group.services.length} layanan tersedia
                      </p>
                    </div>
                    {hasSelectedService && (
                      <span className="ml-2 text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded">
                        Dipilih
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Show cheapest price */}
                    <p className="text-sm font-semibold text-gray-700">
                      Mulai {formatCurrency(Math.min(...group.services.map(s => s.cost)))}
                    </p>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Service Options - Only show when expanded */}
                {isExpanded && (
                  <div className="border-t divide-y">
                    {group.services.map((option, index) => {
                      const isSelected =
                        selectedShipping?.courier === option.courier &&
                        selectedShipping?.service === option.service;

                      return (
                        <div
                          key={`${option.courier}-${option.service}-${index}`}
                          className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent collapse when clicking service
                            onSelectShipping(option);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                  {option.service}
                                </span>
                                {isSelected && (
                                  <span className="text-xs font-medium text-primary">
                                    ✓ Dipilih
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {option.description}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>{option.etd} hari</span>
                              </div>
                            </div>

                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(option.cost)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          });
        })()}
      </div>

      {/* Summary of selected */}
      {selectedShipping && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                {selectedShipping.courierName} - {selectedShipping.service}
              </p>
            </div>
            <p className="text-sm font-bold text-green-900">
              {formatCurrency(selectedShipping.cost)}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
