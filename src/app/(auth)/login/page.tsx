import { LoginForm } from "@/app/components/auth/login-form";
import { LabGuardLogo } from "@/app/components/icons";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-md flex-col items-center">
        <div className="mb-8 flex flex-col items-center text-center">
            <LabGuardLogo className="h-14 w-14 mb-4 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">Log in to your LabGuard Pro account</p>
        </div>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
