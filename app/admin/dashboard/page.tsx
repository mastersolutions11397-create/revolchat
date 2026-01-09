import { redirect } from "next/navigation";
import { checkAuth } from "../actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { LogoutButton, CashoutRow } from "./client-components";
import { Users, DollarSign, TrendingUp, Clock, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const isAuth = await checkAuth();
  if (!isAuth) redirect("/admin/login");

  // Fetch Data Parallelly
  const [
    { data: profiles },
    { data: referrals },
    { data: commissions },
    { data: cashoutRequests }
  ] = await Promise.all([
    supabaseAdmin.from("user_profiles").select("*").order("total_referrals", { ascending: false }).limit(20),
    supabaseAdmin.from("referrals").select("*").order("created_at", { ascending: true }),
    supabaseAdmin.from("referral_commissions").select("*"),
    supabaseAdmin.from("referral_cashout_requests").select("*").order("created_at", { ascending: false })
  ]);

  // --- Calculate Statistics ---
  const totalUsers = profiles?.length || 0; // Note: This is top 20, but we ideally want total count. 
  // For total count of referrers (users with profiles):
  const { count: totalReferrersCount } = await supabaseAdmin.from("user_profiles").select("*", { count: 'exact', head: true });
  
  const totalReferrals = referrals?.length || 0;
  
  const totalRevenue = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
  
  const paidCommissions = commissions?.filter(c => c.status === "paid") || [];
  const totalPaidOut = paidCommissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
  
  const pendingRequests = cashoutRequests?.filter(r => r.status === "pending") || [];
  const totalPendingPayout = pendingRequests.reduce((sum, r) => sum + Number(r.total_amount), 0);
  
  const netEarnings = totalRevenue - totalPaidOut; // Just a metric example

  // --- Chart Data Preparation ---
  // 1. Referrals over time (Last 30 days)
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const referralsByDate = referrals?.reduce((acc: any, curr) => {
    const date = curr.created_at.split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {}) || {};

  const chartData = last30Days.map(date => ({
    date,
    count: referralsByDate[date] || 0
  }));

  const maxReferrals = Math.max(...chartData.map(d => d.count), 1);
  
  // Simple Sparkline SVG Generation
  const chartHeight = 60;
  const chartWidth = 200;
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - (d.count / maxReferrals) * chartHeight;
    return `${x},${y}`;
  }).join(" ");


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
             <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Referral Admin</h1>
            <p className="text-xs text-slate-500">Overview & Management</p>
          </div>
        </div>
        <LogoutButton />
      </nav>
      
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                 <Users className="h-6 w-6" />
               </div>
               <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-600">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalReferrals}</p>
            <p className="text-sm text-slate-500">Referrals Generated</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                 <DollarSign className="h-6 w-6" />
               </div>
               <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Paid</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">${totalPaidOut.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Commissions Paid Out</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                 <Clock className="h-6 w-6" />
               </div>
               <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{pendingRequests.length} Req</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">${totalPendingPayout.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Pending Approvals</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
             
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-600">30 Days</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{chartData.reduce((s, c) => s + c.count, 0)}</p>
              <p className="text-sm text-slate-500">Recent Referrals</p>
            </div>
            
            {/* Simple Line Chart Background */}
            <div className="absolute bottom-0 right-0 w-32 h-16 opacity-20 pointer-events-none">
               <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                 <polyline
                   fill="none"
                   stroke="currentColor"
                   strokeWidth="3"
                   className="text-purple-600"
                   points={points}
                 />
               </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area (Referral Growth) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Referral Growth</h3>
            <div className="h-64 flex items-end justify-between gap-1 w-full">
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                   <div 
                     className="w-full bg-slate-100 group-hover:bg-blue-500 transition-colors rounded-t-sm"
                     style={{ height: `${Math.max((d.count / maxReferrals) * 100, 4)}%` }}
                   />
                   {i % 5 === 0 && (
                     <span className="text-[10px] text-slate-400 mt-2 transform -rotate-45 origin-left">
                       {d.date.slice(5)}
                     </span>
                   )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-400 border-t border-slate-100 pt-2">
              <span>{last30Days[0]}</span>
              <span>{last30Days[last30Days.length - 1]}</span>
            </div>
          </div>

          {/* Top Referrers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-0 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Top Performers</h3>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Refs</th>
                    <th className="px-6 py-3">Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {profiles?.map((profile: any) => (
                    <tr key={profile.user_id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-mono font-medium text-slate-700">
                        {profile.referral_code}
                      </td>
                      <td className="px-6 py-3 font-bold text-slate-900">
                        {profile.total_referrals}
                      </td>
                      <td className="px-6 py-3 text-emerald-600 font-bold">
                        ${Number(profile.total_earnings).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {(!profiles || profiles.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cashout Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Cashout Requests</h3>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
              {pendingRequests.length} Pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                <tr>
                   <th className="px-6 py-3">User</th>
                   <th className="px-6 py-3">Amount</th>
                   <th className="px-6 py-3">Method</th>
                   <th className="px-6 py-3">Date</th>
                   <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <CreditCard className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      No pending cashout requests
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map((req) => (
                    <CashoutRow key={req.id} request={req} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
