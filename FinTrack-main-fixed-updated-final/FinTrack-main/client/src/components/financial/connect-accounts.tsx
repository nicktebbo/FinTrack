import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Building2, Plus, RefreshCw, AlertCircle } from "lucide-react";

export default function ConnectAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const syncAccountsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/sync-accounts", {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to sync accounts");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Accounts Synced",
        description: data.message || "Successfully synced your bank accounts",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync accounts",
        variant: "destructive",
      });
    },
  });

  const connectPlaidMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/plaid/link-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create link token");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.link_token === "placeholder_link_token") {
        toast({
          title: "API Setup Required",
          description: data.message,
          variant: "destructive",
        });
      } else {
        // This would normally open Plaid Link
        toast({
          title: "Bank Connection",
          description: "Plaid Link would open here to connect your bank",
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initialize bank connection",
        variant: "destructive",
      });
    },
  });

  const handleConnectBank = () => {
    setIsConnecting(true);
    connectPlaidMutation.mutate();
    setTimeout(() => setIsConnecting(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Connect Your Bank Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <p className="text-sm text-amber-800">
            To connect real bank accounts, API credentials are required for financial data providers.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">US Banks & Investment Accounts</h4>
              <p className="text-sm text-muted-foreground">Connect via Plaid API</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Plaid</Badge>
              <Button
                onClick={handleConnectBank}
                disabled={isConnecting || connectPlaidMutation.isPending}
                size="sm"
              >
                {isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Connect
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Australian Banks</h4>
              <p className="text-sm text-muted-foreground">Connect via Basiq API</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Basiq</Badge>
              <Button
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Australian bank integration will be available once Basiq API credentials are configured",
                  });
                }}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Connect
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={() => syncAccountsMutation.mutate()}
            disabled={syncAccountsMutation.isPending}
            variant="outline"
            className="w-full"
          >
            {syncAccountsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Connected Accounts
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Required API Credentials:</strong></p>
          <p>• Plaid: PLAID_CLIENT_ID, PLAID_SECRET_KEY, PLAID_ENV</p>
          <p>• Basiq: BASIQ_API_KEY, BASIQ_ENV</p>
        </div>
      </CardContent>
    </Card>
  );
}