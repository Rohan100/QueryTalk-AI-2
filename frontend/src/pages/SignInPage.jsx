import { SignIn } from '@clerk/react';
import { clerkAppearance } from '../lib/clerkAppearance';

export default function SignInPage() {
  return (
    <div className="font-body-sm antialiased h-screen w-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Ambient glow effects matching the app's design */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[150px]" />
        <div className="absolute top-3/4 left-1/2 w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[100px]" />
      </div>

      {/* Clerk's prebuilt SignIn, themed to match the app */}
      <div className="relative z-10  flex items-center w-fit justify-center px-4">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
}
