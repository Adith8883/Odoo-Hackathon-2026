'use client';

import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { getInitials } from '@/utils/formatters';
import Link from 'next/link';
import { toast } from 'sonner';
import { LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/collaboration/NotificationBell';

export function Header() {
  const { user, role, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      logout();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (err: any) {
      toast.error('Logout failed', { description: err?.message });
    }
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Member';
  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          D
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">Dayflow</span>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Badge variant="outline" className="text-[11px] text-muted-foreground border-border/60">
          <Sparkles className="w-3 h-3 mr-1 text-primary" />
          Every workday, perfectly aligned.
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {role === 'hr' && (
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-xs gap-1 hidden sm:flex">
            <Shield className="w-3 h-3" />
            HR Admin
          </Badge>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full p-1 hover:bg-muted/50 transition-colors outline-none cursor-pointer">
              <Avatar className="h-8 w-8 border border-border/60">
                <AvatarImage src={user?.avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left text-xs leading-tight">
                <p className="font-semibold text-foreground">{displayName}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{role || 'Employee'}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.EMPLOYEE.PROFILE} className="cursor-pointer flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
