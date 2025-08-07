import { SignIn } from "@clerk/nextjs";

export default function Page({ searchParams }: { searchParams: { redirect_url?: string } }) {
  return (
    <SignIn 
      fallbackRedirectUrl={searchParams.redirect_url || "/dashboard"}
      signUpFallbackRedirectUrl={searchParams.redirect_url || "/dashboard"}
    />
  );
}