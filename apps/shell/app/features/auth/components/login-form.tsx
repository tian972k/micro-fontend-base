import { useState } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { Button, Input } from "@repo/ui";
import { LogIn, Loader2, Lock, User, ShieldCheck } from "lucide-react";

export function LoginForm() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [error] = useState("");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* Visual Section - Left Side on Desktop */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-10 bg-zinc-900 border-r border-white/5 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/login-bg.png"
            alt="Login Background"
            className="w-full h-full object-cover opacity-80"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg mt-auto mb-20"></div>
      </div>

      {/* Form Section - Right Side */}
      <div className="flex items-center justify-center p-6 lg:p-10 bg-zinc-950">
        <div className="w-full max-w-[420px] space-y-8 animate-fade-in">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-400">
              Enter your credentials to access your account
            </p>
          </div>

          <Form method="post" className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500 flex items-center justify-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                >
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-2.5 text-zinc-500 group-focus-within:text-primary transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={isSubmitting}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-primary/50 transition-all h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-2.5 text-zinc-500 group-focus-within:text-primary transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-primary/50 transition-all h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 text-sm transition-all shadow-lg hover:shadow-primary/25"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-3.5 w-3.5" />
              )}
              Sign In
            </Button>
          </Form>

          <p className="text-center text-xs text-zinc-600">
            Use any credentials to login (mock auth)
          </p>
        </div>
      </div>
    </div>
  );
}
