import React, { useEffect, useMemo, useState } from "react";
import { useAdminUserStore } from "../../../admin/store/adminUserStore";
import { Button } from "../../../user/components/ui/button";
import { Badge } from "../../../user/components/ui/badge";
import { Search, Eye, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function UserList() {
  const { users, fetchUsers, page, limit } = useAdminUserStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers(page, limit);
  }, [fetchUsers, page, limit]);

  const filtered = useMemo(() => {
    return users.filter(u =>
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const onView = (id) => navigate(`/admin/users/${id}`);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase mb-1 md:mb-2 flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          Users
        </h1>
        <p className="text-xs md:text-base text-muted-foreground font-medium italic">
          Manage registered users and view their profiles
        </p>
      </div>

      <div className="bg-secondary/10 p-3 md:p-4 rounded-3xl border border-secondary/20 flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH USERS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-secondary/20 rounded-2xl pl-12 pr-4 py-2 md:py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest text-[10px] md:text-xs"
          />
        </div>
      </div>

      <div className="bg-secondary/5 rounded-[2.5rem] border border-secondary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-secondary/10">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4">Name</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Email</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Phone</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Role</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Registration Date</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {filtered.map(u => (
                <tr key={u.id} className="group hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <p className="font-bold uppercase italic tracking-tight text-xs md:text-sm">{u.name}</p>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <p className="text-[10px] text-primary font-black italic">{u.phone}</p>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <Badge variant="outline" className="text-[8px] md:text-[10px] uppercase tracking-widest">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <Badge variant={u.status === 'Active' ? 'success' : 'secondary'} className="text-[8px] md:text-[10px] uppercase tracking-widest">
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full hover:bg-primary/10 text-primary font-black italic tracking-widest uppercase text-[8px] md:text-[10px] px-2 md:px-3 h-8"
                      onClick={() => onView(u.id)}
                    >
                      View <Eye className="ml-1 md:ml-2 h-3 w-3 text-primary" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 md:p-20 text-center flex flex-col items-center">
            <div className="h-16 w-16 md:h-20 md:w-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
              <Users className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter">No users found</h3>
            <p className="text-muted-foreground italic mt-2">Try adjusting your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
