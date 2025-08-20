import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function OtpVerificationPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation() as any;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState(location?.state?.email || searchParams.get("email") || "");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpCode) {
      toast({ title: "Missing fields", description: "Please enter your email and OTP code.", variant: "destructive" as any });
      return;
    }
    const numericOtp = Number(otpCode);
    if (!Number.isInteger(numericOtp)) {
      toast({ title: "Invalid OTP", description: "OTP code must be a number.", variant: "destructive" as any });
      return;
    }

    setLoading(true);
    try {
      const resp = await api.verifyOtp({ email, otpCode: numericOtp });
      const accessToken = resp?.accessToken;
      const refreshToken = resp?.refreshToken;
      const roles: string[] = Array.isArray(resp?.role) ? resp.role : resp?.role ? [resp.role] : [];

      if (accessToken) {
        localStorage.setItem('auth_token', accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('auth_roles', JSON.stringify(roles));
      }

      toast({ title: "Verified", description: "Your account has been verified." });
      navigate('/');
    } catch (e: any) {
      toast({ title: "Verification failed", description: e?.message || "Invalid or expired OTP.", variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-muted px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-large">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>Enter the OTP code sent to your email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input id="otp" inputMode="numeric" pattern="[0-9]*" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Enter 6-digit code" required />
              </div>
              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? (<><LoadingSpinner size="sm" className="mr-2" /> Verifying...</>) : 'Verify OTP'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Didn’t receive the code? <button className="text-primary underline" type="button" disabled>Resend OTP (coming soon)</button>
            </div>
            <div className="mt-2 text-center text-sm">
              <Link to="/auth" className="text-primary underline">Back to Sign In</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


