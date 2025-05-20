// src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
  const error = searchParams.get("error");
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false, // Handle redirect manually to show toasts
        email: data.email,
        password: data.password,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        let errorMessage = "Login failed. Please check your credentials.";
        if (result.error === "CredentialsSignin") {
            errorMessage = "Invalid email or password.";
        } else if (result.error) {
            errorMessage = result.error; // Use specific error from NextAuth if available
        }
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (result?.ok && result?.url) {
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        });
        router.push(result.url); // Use the URL from NextAuth which includes callbackUrl
      } else {
         toast({
          title: "Login Error",
          description: "An unexpected error occurred during login.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Login submit error:", err);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error === "CredentialsSignin"
              ? "Invalid email or password. Please try again."
              : "An error occurred during login. Please try again."}
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="admin@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  );
}
