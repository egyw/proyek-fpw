import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Buat Akun
          </CardTitle>
          <CardDescription className="text-center">
            Daftar untuk memulai menggunakan aplikasi
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
            />
          </div>

          {/* Nomor HP */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Nomor HP</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="08123456789"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full">
            Daftar
          </Button>
          
          <div className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Masuk disini
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}