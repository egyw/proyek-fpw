import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { 
  MapPin, 
  Clock, 
  Phone,
  ChevronRight,
  Home,
  MessageSquare,
  Send
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Mohon lengkapi form", {
        description: "Nama, email, dan pesan wajib diisi",
      });
      return;
    }

    // Format pesan WhatsApp
    const waMessage = `*Pesan dari Website*\n\nNama: ${formData.name}\nEmail: ${formData.email}\nTelepon: ${formData.phone || "-"}\nSubjek: ${formData.subject || "-"}\n\nPesan:\n${formData.message}`;
    
    const waNumber = "6281338697515"; // Format internasional
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
    
    // Buka WhatsApp
    window.open(waUrl, "_blank");
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    
    toast.success("Mengarahkan ke WhatsApp", {
      description: "Anda akan diarahkan ke WhatsApp untuk mengirim pesan",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Hubungi Kami</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ada pertanyaan atau ingin berkonsultasi? Kami siap membantu Anda dengan senang hati
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Kirim Pesan</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Masukkan nama Anda"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Topik pesan Anda"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Pesan <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Tulis pesan Anda di sini..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Send className="h-5 w-5 mr-2" />
                  Kirim Pesan via WhatsApp
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  Pesan akan dikirim melalui WhatsApp untuk respons yang lebih cepat
                </p>
              </form>
            </Card>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Location Card */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Alamat Toko</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Jl. Bumi Tamalanrea Permai, Paccerakkang<br />
                    Biringkanaya, Makassar<br />
                    Sulawesi Selatan 90562
                  </p>
                </div>
              </div>
            </Card>

            {/* Phone Card */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Telepon / WhatsApp</h3>
                  <a 
                    href="https://wa.me/6281338697515"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    081338697515
                  </a>
                </div>
              </div>
            </Card>

            {/* Business Hours Card */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Jam Operasional</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Senin - Jumat</span>
                      <span className="text-gray-900 font-medium">08:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Sabtu</span>
                      <span className="text-gray-900 font-medium">08:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Minggu</span>
                      <span className="text-gray-900 font-medium">08:00 - 17:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Contact Button */}
            <Card className="p-6 bg-primary text-white">
              <h3 className="font-semibold mb-2">Butuh Bantuan Cepat?</h3>
              <p className="text-sm text-white/90 mb-4">
                Hubungi kami langsung via WhatsApp untuk respons yang lebih cepat
              </p>
              <a
                href="https://wa.me/6281338697515"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Chat WhatsApp
                </Button>
              </a>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lokasi Toko</h2>
          <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.7615!2d119.4917!3d-5.1347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMDgnMDQuOSJTIDExOcKwMjknMzAuMSJF!5e0!3m2!1sen!2sid!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Toko Pelita Bangunan"
            />
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Jl. Bumi Tamalanrea Permai, Paccerakkang, Biringkanaya, Makassar, Sulawesi Selatan 90562
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
