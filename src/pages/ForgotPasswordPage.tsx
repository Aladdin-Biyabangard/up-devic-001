import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.forgotPassword(email);
      toast({ title: "Check your inbox", description: "We sent a password reset link to your email." });
      navigate("/auth");
    } catch (e: any) {
      toast({ title: "Request failed", description: e?.message || "Unable to process your request.", variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-muted px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-large">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? (<><LoadingSpinner size="sm" className="mr-2" /> Sending...</>) : 'Send Reset Link'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link to="/auth" className="text-primary underline">Back to Sign In</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


