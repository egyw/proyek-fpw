import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Crosshair,
  Search,
  Loader2,
  Navigation,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue with Next.js
import L from "leaflet";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Location {
  lat: number;
  lng: number;
}

interface AddressData {
  fullAddress: string;
  district: string; // Kecamatan
  city: string;
  province: string;
  postalCode: string;
}

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    village?: string;
    county?: string;
    city_district?: string;
    municipality?: string;
  };
}

interface AddressMapPickerProps {
  onLocationSelect: (location: Location, address: AddressData) => void;
  initialLocation?: Location;
}

// Component to update map center
function MapUpdater({ center }: { center: Location }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 15);
  }, [center, map]);
  return null;
}

export default function AddressMapPicker({
  onLocationSelect,
  initialLocation,
}: AddressMapPickerProps) {
  const [location, setLocation] = useState<Location>(
    initialLocation || { lat: -6.2088, lng: 106.8456 } // Default: Jakarta
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reverse geocoding: Get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`,
        {
          headers: {
            "User-Agent": "ProyekFPW/1.0", // Required by Nominatim API
          },
        }
      );

      if (!response.ok) throw new Error("Gagal mendapatkan alamat");

      const data = await response.json();
      const addr = data.address;

      // Extract address components
      const fullAddress =
        addr.road ||
        addr.village ||
        addr.suburb ||
        data.display_name.split(",")[0] ||
        "Alamat tidak ditemukan";
      const district =
        addr.suburb || addr.city_district || addr.village || addr.county || "";
      const city =
        addr.city ||
        addr.municipality ||
        addr.county ||
        addr.city_district ||
        "";
      const province = addr.state || "";
      const postalCode = addr.postcode || "";

      const addressData: AddressData = {
        fullAddress,
        district,
        city,
        province,
        postalCode,
      };

      setAddressData(addressData);
      return addressData;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  // Get current location from browser
  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser Anda");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);

        // Get address from coordinates
        const address = await reverseGeocode(newLocation.lat, newLocation.lng);
        if (address) {
          onLocationSelect(newLocation, address);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Gagal mendapatkan lokasi. Pastikan Anda mengizinkan akses lokasi."
        );
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Search address with Nominatim API (autocomplete)
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    try {
      // Prioritize Indonesia search with countrycodes
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=id&addressdetails=1&limit=5&accept-language=id`,
        {
          headers: {
            "User-Agent": "ProyekFPW/1.0",
          },
        }
      );

      if (!response.ok) throw new Error("Gagal mencari alamat");

      const data: SearchResult[] = await response.json();
      setSearchResults(data);
      setShowResults(data.length > 0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(query);
    }, 200); // 300ms delay for faster response
  };

  // Select search result
  const handleSelectResult = async (result: SearchResult) => {
    const newLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    setLocation(newLocation);
    setSearchQuery(result.display_name);
    setShowResults(false);

    // Get full address data
    const address = await reverseGeocode(newLocation.lat, newLocation.lng);
    if (address) {
      onLocationSelect(newLocation, address);
    }
  };

  // Handle map click
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const newLocation = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    };
    setLocation(newLocation);

    // Get address from clicked location
    const address = await reverseGeocode(newLocation.lat, newLocation.lng);
    if (address) {
      onLocationSelect(newLocation, address);
    }
  };

  // Initial reverse geocoding
  useEffect(() => {
    if (initialLocation) {
      reverseGeocode(initialLocation.lat, initialLocation.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Bar with Get Location Button */}
      <div className="space-y-2">
        <Label>Cari Alamat atau Gunakan Lokasi Saat Ini</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Ketik alamat, jalan, atau nama tempat..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
            )}

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <Card className="absolute z-9999 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                <div className="divide-y">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => handleSelectResult(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <p className="text-sm text-gray-900">
                          {result.display_name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="shrink-0"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengambil...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Lokasi Saya
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Ketik minimal 3 karakter untuk mencari, atau klik tombol &quot;Lokasi
          Saya&quot; untuk menggunakan GPS
        </p>
      </div>

      {/* Map Container */}
      <div className="space-y-2">
        <Label>Pilih Lokasi di Peta</Label>
        <div className="relative h-80 rounded-lg overflow-hidden border-2 border-gray-300">
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[location.lat, location.lng]}
              eventHandlers={{
                click: (e: L.LeafletMouseEvent) => handleMapClick(e),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Lokasi Dipilih</p>
                  <p className="text-xs text-gray-600">
                    Lat: {location.lat.toFixed(6)}, Lng:{" "}
                    {location.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
            <MapUpdater center={location} />
            <MapClickHandler onClick={handleMapClick} />
          </MapContainer>

          {/* Crosshair Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-1000">
            <Crosshair className="h-8 w-8 text-primary drop-shadow-lg" />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          🗺️ Klik pada peta untuk memilih lokasi, atau drag marker untuk
          menyesuaikan posisi
        </p>
      </div>

      {/* Address Preview */}
      {addressData && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Alamat Terpilih:
              </p>
              <p className="text-sm text-gray-700">{addressData.fullAddress}</p>
              {addressData.district && (
                <p className="text-xs text-gray-600 mt-1">
                  {addressData.district}
                  {addressData.city && `, ${addressData.city}`}
                  {addressData.province && `, ${addressData.province}`}
                  {addressData.postalCode && ` ${addressData.postalCode}`}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Component to handle map clicks
function MapClickHandler({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  const map = useMap();

  useEffect(() => {
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [map, onClick]);

  return null;
}
