import { Home, Dumbbell, Utensils, Bot, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Dumbbell, label: 'Workout', path: '/workout' },
  { icon: Utensils, label: 'Diet', path: '/diet' },
  { icon: Bot, label: 'AI Coach', path: '/ai-chat' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className={`nav-tab ${isActive ? 'active' : ''}`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}