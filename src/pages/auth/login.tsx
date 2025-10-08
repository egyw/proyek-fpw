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

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log(data);
    // TODO: Implement login logic with tRPC
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
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

      {/* Login Card */}
      <div className="relative w-full max-w-lg">
        {/* Floating decorative elements around card */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-2xl rotate-12 blur-sm"></div>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-sm"></div>
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Card Header with Logo */}
          <div className="bg-gradient-to-br from-primary to-primary/90 px-8 py-10 text-center relative overflow-hidden">
            {/* Header decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]"></div>
            
            <div className="relative z-10">
              <div className="flex justify-center mb-8">
                <Image 
                  src="/images/logo_4x1.png" 
                  alt="Logo" 
                  width={200}
                  height={50}
                  className="brightness-0 invert"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Selamat Datang
              </h1>
              <p className="text-white/80 text-sm">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </div>
          </div>

          {/* Card Body with Form */}
          <div className="px-8 py-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                          className="h-12 border-2 focus:border-primary"
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <Link 
                          href="/auth/forgot-password" 
                          className="text-xs text-primary hover:underline"
                        >
                          Lupa password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Masukkan password"
                          className="h-12 border-2 focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold mt-6 shadow-lg hover:shadow-xl transition-all"
                >
                  Masuk
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">atau masuk dengan</span>
              </div>
            </div>

            {/* Social Login Button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 border-2 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600 mt-8">
              Belum punya akun?{' '}
              <Link 
                href="/auth/register" 
                className="text-primary font-semibold hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decorative text */}
        <p className="text-center text-white/60 text-xs mt-6">
          Dengan masuk, Anda menyetujui{' '}
          <Link href="/terms" className="underline hover:text-white">
            Syarat & Ketentuan
          </Link>
          {' '}dan{' '}
          <Link href="/privacy" className="underline hover:text-white">
            Kebijakan Privasi
          </Link>
        </p>
      </div>
    </div>
  );
}