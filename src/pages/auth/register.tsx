import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  phoneNumber: z.string().min(10, 'Nomor HP minimal 10 digit').regex(/^[0-9]+$/, 'Hanya boleh angka'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    console.log(data);
    // TODO: Implement registration logic with tRPC
  };
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/3 rounded-full blur-2xl"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        
        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-white to-transparent top-1/4 rotate-12"></div>
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-white to-transparent top-2/4 -rotate-12"></div>
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-white to-transparent top-3/4 rotate-12"></div>
        </div>
      </div>

      {/* Left Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 p-12 xl:p-16 flex-col justify-center text-white relative z-10">
        <div className="max-w-3xl">
          {/* Logo */}
          <div className="mb-16">
            <Image 
              src="/images/logo_4x1.png" 
              alt="Logo Toko" 
              width={250}
              height={50}
              className="brightness-0 invert"
            />
          </div>

          {/* Headline */}
          <div className="mb-12">
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Bergabunglah Bersama Kami
            </h1>
            <p className="text-base text-white/80 leading-relaxed">
              Nikmati berbagai keuntungan berbelanja material bangunan berkualitas dengan harga terbaik
            </p>
          </div>

          {/* Benefits List - More Content */}
          <div className="space-y-6">
            {/* Benefit 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Diskon & Promo Eksklusif</h3>
                <p className="text-sm text-white/70 leading-relaxed">Nikmati berbagai penawaran dan promo menarik khusus untuk member setiap bulan.</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Material Berkualitas Terjamin</h3>
                <p className="text-sm text-white/70 leading-relaxed">Semua produk berstandar SNI dan telah melewati quality control ketat</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Return & Garansi Mudah</h3>
                <p className="text-sm text-white/70 leading-relaxed">Tidak puas? Return dalam 7 hari dengan proses cepat dan tanpa ribet</p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Pengiriman Cepat & Aman</h3>
                <p className="text-sm text-white/70 leading-relaxed">Gratis ongkir pembelian di atas 5 juta dengan layanan same day delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10 xl:p-12 relative z-10">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl p-10 lg:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">
              Buat Akun
            </h1>
            <p className="text-sm text-muted-foreground">
              Isi data diri untuk membuat akun baru
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Nama Lengkap */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama lengkap"
                        className="h-11 placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        className="h-11 placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nomor HP */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Nomor HP</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="08123456789"
                        className="h-11 placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Minimal 8 karakter"
                        className="h-11 placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Konfirmasi Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Masukkan ulang password"
                        className="h-11 placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full mt-8 h-11">
                Daftar Sekarang
              </Button>
            </form>
          </Form>
          
          <p className="text-sm text-center text-muted-foreground mt-6">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Masuk disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}