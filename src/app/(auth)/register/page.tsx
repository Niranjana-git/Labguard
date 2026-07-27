import { RegisterForm } from "@/app/components/auth/register-form";
import { LabGuardLogo } from "@/app/components/icons";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <div className="mb-8 flex flex-col items-center text-center">
          <LabGuardLogo className="h-14 w-14 mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Create an Account</h1>
          <p className="text-muted-foreground">Join LabGuard Pro to monitor your lab</p>
      </div>
      <RegisterForm />
       <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
