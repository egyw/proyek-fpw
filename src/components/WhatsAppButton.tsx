import { MessageCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';

interface WhatsAppButtonProps {
  defaultMessage?: string;
}

export default function WhatsAppButton({ 
  defaultMessage = 'Halo, saya ingin bertanya tentang produk...'
}: WhatsAppButtonProps) {
  // Fetch store config untuk mendapatkan nomor WhatsApp
  const { data: storeConfig } = trpc.store.getConfig.useQuery();
  
  // Helper: Convert local format (08...) to international (628...)
  const formatPhoneForWhatsApp = (phone: string) => {
    if (phone.startsWith('08')) {
      return '62' + phone.substring(1);
    }
    return phone;
  };
  
  // Gunakan nomor dari database, fallback ke phone jika whatsapp kosong
  const rawPhone = storeConfig?.contact?.whatsapp !== '-' && storeConfig?.contact?.whatsapp
    ? storeConfig.contact.whatsapp
    : storeConfig?.contact?.phone || '6281234567890';
  
  const phoneNumber = formatPhoneForWhatsApp(rawPhone);
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
  
  // Don't render until store config is loaded
  if (!storeConfig) {
    return null;
  }
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat via WhatsApp"
    >
      {/* Pulse animation background */}
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75 group-hover:opacity-0 transition-opacity"></div>
      
      {/* Button */}
      <div className="relative flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all group-hover:scale-110">
        <MessageCircle className="h-6 w-6" />
      </div>
    </a>
  );
}
