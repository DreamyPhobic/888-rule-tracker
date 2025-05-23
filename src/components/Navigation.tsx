
import React from 'react';
import { Button } from '@/components/ui/button';
import { Timer, LogOut, BarChart2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-accent" />
            <Link to="/">
              <h1 className="font-bold text-xl">888 Time Tracker</h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link to="/">
                    <Timer className="h-4 w-4 mr-1" />
                    Today
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link to="/history">
                    <BarChart2 className="h-4 w-4 mr-1" />
                    History
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
