// RajaOngkir API Helper
// Docs: https://rajaongkir.com/dokumentasi

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY || '';
// Updated: RajaOngkir uses Komerce platform
const RAJAONGKIR_BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

// Courier configuration based on RajaOngkir plan
export const COURIER_CONFIG = {
  // FREE Plan (Starter) - Only 3 couriers
  free: ['jne', 'pos', 'tiki'],
  
  // PAID Plan (Basic/Pro) - All couriers
  all: [
    'jne',      // JNE
    'pos',      // POS Indonesia
    'tiki',     // TIKI
    'sicepat',  // SiCepat (Domestic only)
    'ide',      // IDExpress (Domestic only)
    'sap',      // SAP Express (Domestic only)
    'ninja',    // Ninja Xpress (Domestic only)
    'jnt',      // J&T Express (Domestic only)
    'wahana',   // Wahana Express (Domestic only)
    'lion',     // Lion Parcel (Domestic only)
    'rex',      // Royal Express Asia (Domestic only)
  ],
  
  // Couriers that support international shipping
  international: ['jne', 'tiki', 'pos'],
  
  // Courier names for display
  names: {
    jne: 'JNE',
    pos: 'POS Indonesia',
    tiki: 'TIKI',
    sicepat: 'SiCepat',
    ide: 'ID Express',
    sap: 'SAP Express',
    ninja: 'Ninja Xpress',
    jnt: 'J&T Express',
    wahana: 'Wahana Express',
    lion: 'Lion Parcel',
    rex: 'Royal Express Asia',
  } as Record<string, string>,
};

export interface Province {
  province_id: string;
  province: string;
}

export interface City {
  city_id: string;
  province_id: string;
  province: string;
  type: string; // "Kota" or "Kabupaten"
  city_name: string;
  postal_code: string;
}

export interface Subdistrict {
  subdistrict_id: string;
  province_id: string;
  province: string;
  city_id: string;
  city: string;
  type: string;
  subdistrict_name: string;
}

export interface ShippingCost {
  code: string; // Courier code (jne, pos, tiki)
  name: string; // Courier name
  costs: Array<{
    service: string; // Service type (REG, YES, OKE, etc)
    description: string;
    cost: Array<{
      value: number; // Cost in IDR
      etd: string; // Estimated delivery time (e.g., "1-2")
      note: string;
    }>;
  }>;
}

// Komerce API Response Format for Shipping Cost
interface KomerceShippingItem {
  name: string;       // e.g., "Lion Parcel"
  code: string;       // e.g., "lion"
  service: string;    // e.g., "JAGOPACK"
  description: string; // e.g., "Economy Service"
  cost: number;       // e.g., 7000
  etd: string;        // e.g., "1-4 day"
}

// 1. Get All Provinces
export async function getProvinces(): Promise<Province[]> {
  try {
    const response = await fetch(`${RAJAONGKIR_BASE_URL}/destination/province`, {
      method: 'GET',
      headers: {
        'key': RAJAONGKIR_API_KEY,
      },
    });

    const data = await response.json();
    
    // Komerce API format: { meta: { code, status, message }, data: [...] }
    if (data.meta && data.meta.code !== 200) {
      throw new Error(data.meta.message || 'Failed to fetch provinces');
    }

    return data.data as Province[];
  } catch (error) {
    console.error('[getProvinces] Error:', error);
    throw new Error('Failed to fetch provinces');
  }
}

// 2. Get Cities by Province
export async function getCitiesByProvince(provinceId: string): Promise<City[]> {
  try {
    // Note: Komerce API might have different endpoint structure
    // For now, using domestic-destination endpoint (provinceId filtering may need adjustment)
    const response = await fetch(
      `${RAJAONGKIR_BASE_URL}/destination/domestic-destination?search=&limit=100&offset=0&province=${provinceId}`,
      {
        method: 'GET',
        headers: {
          'key': RAJAONGKIR_API_KEY,
        },
      }
    );

    const data = await response.json();
    
    // Komerce API format
    if (data.meta && data.meta.code !== 200) {
      throw new Error(data.meta.message || 'Failed to fetch cities');
    }

    return data.data as City[];
  } catch (error) {
    console.error('[getCitiesByProvince] Error:', error);
    throw new Error('Failed to fetch cities');
  }
}

// 3. Search City by Name (untuk match dengan input user)
export async function searchCity(cityName: string): Promise<City[]> {
  try {
    const response = await fetch(
      `${RAJAONGKIR_BASE_URL}/destination/domestic-destination?search=${encodeURIComponent(cityName)}&limit=50&offset=0`, 
      {
        method: 'GET',
        headers: {
          'key': RAJAONGKIR_API_KEY,
        },
      }
    );

    const data = await response.json();
    
    // Komerce API format
    if (data.meta && data.meta.code !== 200) {
      throw new Error(data.meta.message || 'Failed to search city');
    }

    return data.data as City[];
  } catch (error) {
    console.error('[searchCity] Error:', error);
    throw new Error('Failed to search city');
  }
}

// 3.1 Check if destination is international (not in Indonesia)
export async function isInternationalDestination(cityName: string): Promise<boolean> {
  try {
    // Search in Indonesia cities database
    const cities = await searchCity(cityName);
    
    // If no match found in Indonesia cities, assume international
    return cities.length === 0;
  } catch (error) {
    console.error('[isInternationalDestination] Error:', error);
    // Default to domestic if error
    return false;
  }
}

// 3.2 Get available couriers based on destination
export function getAvailableCouriers(
  isInternational: boolean,
  plan: 'free' | 'all' = 'free'
): string[] {
  if (isInternational) {
    // International: only JNE, TIKI, POS
    return COURIER_CONFIG.international;
  }
  
  // Domestic: depends on plan
  return plan === 'free' ? COURIER_CONFIG.free : COURIER_CONFIG.all;
}

// 4. Calculate Shipping Cost
export async function calculateShippingCost(params: {
  origin: string; // City ID toko (e.g., "501" for Yogyakarta)
  destination: string; // City ID customer
  weight: number; // Weight in grams (e.g., 1000 = 1kg)
  courier: string; // "jne" | "pos" | "tiki" | "sicepat" | etc
}): Promise<ShippingCost[]> {
  try {
    // Validate API key
    if (!RAJAONGKIR_API_KEY) {
      throw new Error('RAJAONGKIR_API_KEY is not set in environment variables');
    }
    
    // Komerce API expects form-urlencoded body
    const formData = new URLSearchParams();
    formData.append('origin', params.origin);
    formData.append('destination', params.destination);
    formData.append('weight', params.weight.toString());
    formData.append('courier', params.courier);

    const response = await fetch(`${RAJAONGKIR_BASE_URL}/calculate/district/domestic-cost`, {
      method: 'POST',
      headers: {
        'key': RAJAONGKIR_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    // Check HTTP response status
    if (!response.ok) {
      console.error('[calculateShippingCost] HTTP Error:', response.status, response.statusText);
      
      // Specific error messages for common issues
      if (response.status === 401) {
        throw new Error('HTTP 401: Unauthorized - API key is invalid. Check RAJAONGKIR_API_KEY in .env.local');
      }
      if (response.status === 410) {
        throw new Error('HTTP 410: Gone - API key expired or suspended. Login to https://rajaongkir.com/panel/dashboard to check account status and generate new API key');
      }
      if (response.status === 429) {
        throw new Error('HTTP 429: Too Many Requests - API quota exceeded (FREE plan: 1000 req/month). Upgrade plan or wait until next month');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Debug: Log response structure (comment out in production)
    console.log('[calculateShippingCost] Response for', params.courier, ':', JSON.stringify(data, null, 2));
    
    // Komerce API format: { meta: { code, status, message }, data: [array of services] }
    if (!data || !data.meta) {
      console.error('[calculateShippingCost] Invalid response structure:', data);
      throw new Error(`Invalid response from RajaOngkir API. Response: ${JSON.stringify(data)}`);
    }
    
    // Check Komerce status
    if (data.meta.code !== 200) {
      const errorMsg = data.meta.message || 'Unknown error';
      console.error('[calculateShippingCost] RajaOngkir Error:', errorMsg);
      throw new Error(`RajaOngkir API Error: ${errorMsg}`);
    }
    
    // Check if data.data exists and is an array
    if (!data.data || !Array.isArray(data.data)) {
      console.error('[calculateShippingCost] No data in response:', data);
      throw new Error('No shipping options available from RajaOngkir');
    }

    // Response format from Komerce API:
    // data.data = [
    //   {
    //     "name": "Lion Parcel",
    //     "code": "lion", 
    //     "service": "JAGOPACK",
    //     "description": "Economy Service",
    //     "cost": 7000,
    //     "etd": "1-4 day"
    //   }
    // ]
    
    // Map Komerce format to our ShippingCost interface
    const shippingCosts: ShippingCost[] = data.data.map((item: KomerceShippingItem) => ({
      code: item.code, // courier code (e.g., "lion", "jne")
      name: item.name, // courier name (e.g., "Lion Parcel")
      costs: [
        {
          service: item.service, // service code (e.g., "JAGOPACK")
          description: item.description, // service description
          cost: [
            {
              value: item.cost, // shipping cost
              etd: item.etd, // estimated delivery time
              note: '',
            }
          ]
        }
      ]
    }));

    return shippingCosts;
  } catch (error) {
    console.error('[calculateShippingCost] Error:', error);
    
    // If API key not set, throw specific error
    if (!RAJAONGKIR_API_KEY) {
      throw new Error('RAJAONGKIR_API_KEY not configured. Please add it to .env.local and restart server.');
    }
    
    throw new Error('Failed to calculate shipping cost');
  }
}

// 4.1 Calculate shipping cost for multiple couriers
export async function calculateMultipleCouriers(params: {
  origin: string;
  destination: string;
  weight: number;
  couriers: string[]; // Array of courier codes
}): Promise<ShippingCost[]> {
  try {
    // Fetch all couriers in parallel
    const promises = params.couriers.map(courier =>
      calculateShippingCost({
        origin: params.origin,
        destination: params.destination,
        weight: params.weight,
        courier,
      }).catch(error => {
        console.warn(`[${courier}] Failed to fetch:`, error.message);
        return []; // Return empty array if courier fails
      })
    );

    const results = await Promise.all(promises);
    
    // Flatten and filter out empty results
    return results.flat().filter(result => result !== null);
  } catch (error) {
    console.error('[calculateMultipleCouriers] Error:', error);
    throw new Error('Failed to calculate shipping costs');
  }
}

// 5. Helper: Convert Product Weight to Grams
export function calculateTotalWeight(cartItems: Array<{
  quantity: number;
  // Assume each product has weight in kg or default to 1kg
  weight?: number; // in kg
}>): number {
  const totalWeightKg = cartItems.reduce((total, item) => {
    const itemWeight = item.weight || 1; // Default 1kg if not specified
    return total + (itemWeight * item.quantity);
  }, 0);
  
  // Convert to grams
  return Math.ceil(totalWeightKg * 1000);
}

// 6. Helper: Format City for Display
export function formatCityName(city: City): string {
  return `${city.type} ${city.city_name}`;
}
