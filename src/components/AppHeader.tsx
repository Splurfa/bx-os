
import { LogOut, User, GraduationCap, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';

const AppHeader = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const { getDisplayName, getTeacherDisplayInfo, profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4 fade-in flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm tracking-tight">BS</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              {getDisplayName()}
            </h1>
            <p className="text-xs text-muted-foreground">
              {getTeacherDisplayInfo() || "Behavior Support"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NotificationBell 
            userRole={profile?.role || 'teacher'}
            showPWAGuidance={true}
          />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-auto h-10 px-3 rounded-full bg-muted hover:bg-muted/80 transition-colors duration-200 flex items-center space-x-2"
            >
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {profile?.role || user?.user_metadata?.role || 'teacher'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
