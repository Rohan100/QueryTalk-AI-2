import { SignUp } from '@clerk/react';
import { clerkAppearance } from '../lib/clerkAppearance';

export default function SignUpPage() {
  return (
    <div className="font-body-sm antialiased h-screen w-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Ambient glow effects matching the app's design */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary/4 rounded-full blur-[180px]" />
      </div>

      {/* Clerk's prebuilt SignUp, themed to match the app */}
      <div className="relative z-10 w-fit flex items-center justify-center px-4">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
}
