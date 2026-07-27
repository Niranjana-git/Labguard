

'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User as UserIcon,
  Wrench,
  Globe,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/app/(app)/layout';

type AppHeaderProps = {
  name: string | null;
  role: string | null;
  clusterIds: string[] | null;
};

export function AppHeader({ name, role, clusterIds }: AppHeaderProps) {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (nameOrEmail: string | null | undefined) => {
    if (!nameOrEmail) return 'U';

    if (nameOrEmail.includes(' ')) {
      return nameOrEmail
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }

    return nameOrEmail[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Home className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">LabGuard Pro</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/technician"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              Technician
            </Link>
            <Link
              href="/teacher"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              Teacher
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-4">
        {role === 'Technician' && clusterIds && clusterIds.length > 0 && (
          <div className="hidden items-center gap-2 md:flex">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Assigned Clusters:</span>
            <div className="flex gap-1.5">
              {clusterIds.map((id) => (
                <Badge key={id} variant="secondary">
                  {id.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Can be used for search in the future */}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Globe className="h-5 w-5" />
            <span className="sr-only">Change Language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
            English
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLanguage('hi')} className={language === 'hi' ? 'bg-accent' : ''}>
            हिन्दी (Hindi)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLanguage('ta')} className={language === 'ta' ? 'bg-accent' : ''}>
            தமிழ் (Tamil)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar>
              <AvatarImage
                src={user?.photoURL || undefined}
                alt="User avatar"
              />
              <AvatarFallback>{getInitials(name || user?.email)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{name || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
