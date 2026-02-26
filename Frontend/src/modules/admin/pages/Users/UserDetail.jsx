import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAdminUserStore } from "../../../admin/store/adminUserStore";
import { Badge } from "../../../user/components/ui/badge";
import { Button } from "../../../user/components/ui/button";
import { Label } from "../../../user/components/ui/label";
import { format } from "date-fns";
import { User as UserIcon, Mail, Phone, Calendar, Shield, ShoppingBag, Heart } from "lucide-react";

export default function UserDetail() {
  const { id } = useParams();
  const { selectedUser, selectedUserOrders, selectedUserMetrics, fetchUserDetail, loading } = useAdminUserStore();

  useEffect(() => {
    if (id) fetchUserDetail(id);
  }, [id, fetchUserDetail]);

  const u = selectedUser;
  const m = selectedUserMetrics;
  const derivedOrderCount = m?.orderCount ?? (Array.isArray(selectedUserOrders) ? selectedUserOrders.length : 0);
  const derivedActiveCount = m?.activeOrderCount ?? (Array.isArray(selectedUserOrders) ? selectedUserOrders.filter(o => o.status?.toLowerCase() !== 'cancelled').length : 0);
  const derivedCancelledCount = m?.cancelledOrderCount ?? (Array.isArray(selectedUserOrders) ? selectedUserOrders.filter(o => o.status?.toLowerCase() === 'cancelled').length : 0);
  const derivedTotalSpending = m?.totalSpending ?? (Array.isArray(selectedUserOrders) ? selectedUserOrders.filter(o => o.status?.toLowerCase() !== 'cancelled').reduce((acc, o) => acc + (o.total || 0), 0) : 0);

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-secondary/10 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              User Profile
            </h1>
          </div>
          <p className="text-sm md:text-lg text-muted-foreground font-medium italic pl-1">
            Comprehensive overview of user activity & identity
          </p>
        </div>
      </div>

      {!u && loading && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
           <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
           <p className="text-muted-foreground font-black italic uppercase tracking-widest text-xs">Synchronizing Data...</p>
        </div>
      )}

      {u && (
        <div className="space-y-10">
          {/* Main Identity & Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* User Identity Card */}
            <div className="lg:col-span-8 bg-background border border-secondary/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-secondary/5 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-secondary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <Badge variant={u.status === 'Active' ? 'success' : 'destructive'} className="text-[10px] font-black uppercase tracking-widest px-3 py-1">
                     {u.status}
                   </Badge>
                </div>
                
                <div className="relative mb-6">
                  <div className="h-28 w-28 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner group overflow-hidden">
                    <UserIcon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-background border border-secondary/20 flex items-center justify-center shadow-lg">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">{u.name}</h2>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] border-primary/30 text-primary">
                  {u.role}
                </Badge>
              </div>

              <div className="md:w-2/3 p-8 lg:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Contact Details</Label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 group">
                          <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:bg-primary/10 transition-colors">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-bold truncate">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-3 group">
                          <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:bg-primary/10 transition-colors">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-bold">{u.phone || 'Not Provided'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Account Metadata</Label>
                      <div className="flex items-center gap-3 group">
                        <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:bg-primary/10 transition-colors">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-bold">Joined {u.createdAt ? format(new Date(u.createdAt), 'MMMM dd, yyyy') : '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary block">Verified Address</Label>
                    </div>
                    <p className="text-sm font-black italic tracking-tight uppercase leading-relaxed text-foreground">
                      {(u.address || u.city || u.state || u.zipCode) 
                        ? (
                          <>
                            {u.address && <span className="block mb-1">{u.address}</span>}
                            <span className="text-muted-foreground">
                              {u.city}{u.city && u.state ? ', ' : ''}{u.state} {u.zipCode && `- ${u.zipCode}`}
                            </span>
                          </>
                        ) 
                        : 'No primary address configured for this account.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Metrics Column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-foreground text-background p-6 rounded-[2rem] border border-secondary/20 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 mb-6">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Revenue Impact</span>
                </div>
                <div className="flex items-baseline gap-1">
                   <p className="text-4xl font-black italic tracking-tighter">₹{(derivedTotalSpending || 0).toLocaleString()}</p>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">LIFETIME VALUE (LTV)</p>
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-30 mt-0.5">Excludes {derivedCancelledCount} cancelled</p>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-secondary/10 p-6 rounded-[2rem] border border-secondary/20 flex flex-col justify-between">
                  <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-secondary/20 mb-4">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-3xl font-black italic tracking-tighter">{derivedOrderCount}</p>
                    <p className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Total Orders</p>
                    {derivedCancelledCount > 0 && (
                      <p className="text-[8px] font-bold tracking-widest uppercase text-red-400 mt-0.5">{derivedCancelledCount} cancelled</p>
                    )}
                  </div>
                </div>
                <div className="bg-secondary/10 p-6 rounded-[2rem] border border-secondary/20 flex flex-col justify-between">
                  <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-secondary/20 mb-4">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-3xl font-black italic tracking-tighter">{m?.wishlistCount || 0}</p>
                    <p className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Wishlist items</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-black italic tracking-tighter uppercase">Order History</h3>
              </div>
              <Badge variant="outline" className="font-bold">{selectedUserOrders.length} Records</Badge>
            </div>

            <div className="bg-background border border-secondary/20 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-secondary/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-secondary/20">
                    <tr>
                      <th className="px-8 py-5">Order Reference</th>
                      <th className="px-8 py-5">Fulfillment Date</th>
                      <th className="px-8 py-5 text-center">Items</th>
                      <th className="px-8 py-5">Financials</th>
                      <th className="px-8 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/10">
                    {selectedUserOrders.map(o => (
                      <tr key={o.id} className="group hover:bg-secondary/5 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-black italic tracking-tighter uppercase group-hover:text-primary transition-colors">
                            #{o.id.slice(-8).toUpperCase()}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {o.date ? format(new Date(o.date), 'MMM dd, yyyy') : '-'}
                          </p>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20">
                            <span className="font-black italic text-xs">{o.itemsCount}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className={cn(
                            "font-black italic text-sm",
                            o.status?.toLowerCase() === 'cancelled' && "line-through text-red-400 opacity-60"
                          )}>₹{(o.total || 0).toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-3 py-1",
                              o.status?.toLowerCase() === 'delivered' ? 'border-primary/50 text-primary bg-primary/5' : '',
                              o.status?.toLowerCase() === 'cancelled' ? 'border-red-500/50 text-red-500 bg-red-500/5' : ''
                            )}
                          >
                            {o.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {selectedUserOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-16 text-center">
                           <div className="flex flex-col items-center gap-3">
                             <div className="h-12 w-12 rounded-2xl bg-secondary/5 flex items-center justify-center">
                               <ShoppingBag className="h-6 w-6 text-muted-foreground opacity-20" />
                             </div>
                             <p className="text-xs font-black italic uppercase tracking-[0.2em] text-muted-foreground/50">Zero transactional footprints</p>
                           </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
