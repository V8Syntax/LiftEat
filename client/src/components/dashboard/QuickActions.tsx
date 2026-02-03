import { Plus, Dumbbell, Utensils, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { 
    icon: Dumbbell, 
    label: 'Start Workout', 
    path: '/workout/new',
    gradient: 'from-primary to-success' 
  },
  { 
    icon: Utensils, 
    label: 'Log Meal', 
    path: '/diet/log',
    gradient: 'from-accent to-primary' 
  },
  { 
    icon: Bot, 
    label: 'Ask AI', 
    path: '/ai-chat',
    gradient: 'from-warning to-destructive' 
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.path}
            to={action.path}
            className="glass-card p-4 flex flex-col items-center gap-2 glow-hover"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xs text-center font-medium">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}