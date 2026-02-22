import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * SubscriptionGuard - Protects features behind subscription limits
 * Prevents users from using features they don't have access to
 */
export default function SubscriptionGuard({
  type = 'video',
  onAccess,
  children,
  fallback
}) {
  const [canAccess, setCanAccess] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
    const interval = setInterval(checkAccess, 5 * 60 * 1000); // Check every 5 min
    return () => clearInterval(interval);
  }, [type]);

  const checkAccess = async () => {
    try {
      const result = await base44.functions.invoke('checkUserLimits', { type });
      setCanAccess(result.data?.can_use || false);
      setLimits(result.data);
      setLoading(false);

      if (result.data?.can_use && onAccess) {
        onAccess(result.data);
      }
    } catch (error) {
      console.error('Failed to check access:', error);
      setCanAccess(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="h-32 bg-white/5 rounded-lg" />
      </div>
    );
  }

  if (!canAccess) {
    return fallback || (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-white font-semibold mb-1">
              Límite de generaciones alcanzado
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Has alcanzado el límite de {limits?.limit} generaciones de {type}s este mes.
              Quedan {limits?.remaining} / {limits?.limit}.
            </p>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = '/'}
            >
              Mejorar plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {limits && limits.percentage_used > 80 && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
          <p className="text-xs text-yellow-300">
            Has usado el {limits.percentage_used}% de tu límite ({limits.used}/{limits.limit})
          </p>
        </div>
      )}
      {children}
    </div>
  );
}