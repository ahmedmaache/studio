// src/app/admin/(auth)/login/page.tsx
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from '@/components/icons/logo';

export default function AdminLoginPage() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <Logo width={150} height={50} />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading form...</div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
