import { useEffect, useState } from "react";
import { useSearchParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@/lib/api";

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'cancel' | 'error'>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const mode = searchParams.get('mode');
    const courseId = searchParams.get('courseId') || '';
    const verify = async () => {
      try {
        if (mode === 'success' && courseId) {
          const res = await api.verifyPaymentSuccess(courseId);
          setStatus('success');
          setMessage(res?.message || 'Payment verified successfully.');
        } else if (mode === 'cancel') {
          const res = await api.paymentCancel();
          setStatus('cancel');
          setMessage(res?.message || 'Payment was canceled.');
        } else {
          setStatus('error');
          setMessage('Invalid payment status.');
        }
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message || 'Failed to process payment status.');
      }
    };
    verify();
  }, [location.search]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <Card className="max-w-md w-full shadow-md">
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>Review the outcome of your recent payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="text-sm">{message}</div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/">Go to Home</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


