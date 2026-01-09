"use client";

import { useState } from "react";
import { approveCashout, rejectCashout, logout } from "../actions";
import { Loader2, Check, X, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}

export function CashoutRow({ request }: { request: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction(action: "approve" | "reject") {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    
    setLoading(true);
    try {
      const result = action === "approve" 
        ? await approveCashout(request.id)
        : await rejectCashout(request.id);
        
      if (result.success) {
        toast.success(`Request ${action}ed successfully`);
        router.refresh(); // Refresh server data
      } else {
        toast.error(result.error || `Failed to ${action} request`);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="hover:bg-slate-50 border-b border-slate-100 last:border-0 text-sm">
      <td className="px-6 py-4 text-slate-900 font-medium truncate max-w-[200px]" title={request.user_id}>
        {request.user_email || "Unknown User"} 
        <span className="block text-xs text-slate-400 font-normal">{request.user_id.slice(0, 8)}...</span>
      </td>
      <td className="px-6 py-4 text-slate-900 font-bold">${request.total_amount}</td>
      <td className="px-6 py-4 text-slate-500">
        {request.payment_method === "paypal" ? (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> PayPal
          </span>
        ) : request.payment_method === "bank_transfer" ? (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" /> Bank
          </span>
        ) : (
          request.payment_method
        )}
      </td>
      <td className="px-6 py-4 text-slate-500">
        {new Date(request.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        {request.status === "pending" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction("approve")}
              disabled={loading}
              className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={loading}
              className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              title="Reject"
            >
              <X className="h-4 w-4" />
            </button>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>
        ) : (
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            request.status === 'completed' ? 'bg-green-100 text-green-700' : 
            request.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100'
          }`}>
            {request.status}
          </span>
        )}
      </td>
    </tr>
  );
}
