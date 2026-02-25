import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAdminUserStore } from "../../../admin/store/adminUserStore";
import { Badge } from "../../../user/components/ui/badge";
import { Button } from "../../../user/components/ui/button";
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
  const derivedTotalSpending = m?.totalSpending ?? (Array.isArray(selectedUserOrders) ? selectedUserOrders.reduce((acc, o) => acc + (o.total || 0), 0) : 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase mb-1 md:mb-2 flex items-center gap-3">
            <UserIcon className="h-6 w-6 text-primary" />
            User Profile
          </h1>
          <p className="text-xs md:text-base text-muted-foreground font-medium italic">Full details and activity</p>
        </div>
      </div>

      {!u && loading && (
        <div className="p-10 text-center text-muted-foreground">Loading...</div>
      )}

      {u && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 bg-secondary/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-secondary/20 space-y-4 md:space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center p-0.5 border border-primary/20 overflow-hidden">
                  <UserIcon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">{u.name}</h2>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest">{u.role}</Badge>
                    <Badge variant={u.status === 'Active' ? 'success' : 'secondary'} className="text-[9px] uppercase tracking-widest">{u.status}</Badge>
                    {u.isVerified && <Badge variant="default" className="text-[9px] uppercase tracking-widest">Verified</Badge>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs md:text-sm">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="text-xs md:text-sm">{u.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs md:text-sm">Registered {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs md:text-sm">Account {u.status}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {(u.address || u.city || u.state || u.zipCode) ? `${u.address || ''}${u.city ? ', ' + u.city : ''}${u.state ? ', ' + u.state : ''}${u.zipCode ? ' - ' + u.zipCode : ''}` : 'No address on file'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="bg-secondary/10 p-5 md:p-6 rounded-[1.5rem] border border-secondary/20">
                <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Activity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-background border border-secondary/20">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="text-[10px] uppercase font-black tracking-widest">Orders</span>
                    </div>
                    <p className="text-xl font-black italic mt-1">{derivedOrderCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-secondary/20">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="text-[10px] uppercase font-black tracking-widest">Total Spend</span>
                    </div>
                    <p className="text-xl font-black italic mt-1">₹{(derivedTotalSpending || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-secondary/20">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="text-[10px] uppercase font-black tracking-widest">Wishlist</span>
                    </div>
                    <p className="text-xl font-black italic mt-1">{m?.wishlistCount || 0}</p>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary/5 rounded-[2.5rem] border border-secondary/10 overflow-hidden">
            <div className="p-5 md:p-8">
              <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-muted-foreground mb-4">Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-secondary/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-secondary/10">
                    <tr>
                      <th className="px-4 py-3 md:px-6 md:py-4">Date</th>
                      <th className="px-4 py-3 md:px-6 md:py-4">Items</th>
                      <th className="px-4 py-3 md:px-6 md:py-4">Total</th>
                      <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/10">
                    {selectedUserOrders.map(o => (
                      <tr key={o.id} className="group hover:bg-secondary/10 transition-colors">
                        <td className="px-4 py-3 md:px-6 md:py-4">
                          <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            {o.date ? format(new Date(o.date), 'MMM dd, yyyy') : '-'}
                          </p>
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4">
                          <p className="font-black italic text-xs md:text-sm">{o.itemsCount}</p>
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4">
                          <p className="font-black italic text-xs md:text-sm">₹{(o.total || 0).toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4">
                          <Badge variant="outline" className="text-[8px] md:text-[10px] uppercase tracking-widest">{o.status}</Badge>
                        </td>
                      </tr>
                    ))}
                    {selectedUserOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No orders</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
