import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  BellRing, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Settings,
  Target,
  User,
  Sparkles,
  Palette,
  Rocket,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "15-Min Launch", href: "/launch-wizard", icon: Rocket },
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Campaigns", href: "/campaigns", icon: BellRing },
  { name: "Targeting", href: "/targeting", icon: MapPin },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "AI Copy Generator", href: "/ad-copy-generator", icon: Sparkles },
  { name: "Channel Planner", href: "/channel-planner", icon: Target },
  { name: "Visual Style Guide", href: "/visual-style", icon: Palette },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  businessName?: string | null;
  onLogout?: () => void;
}

export default function Sidebar({ businessName, onLogout }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Hyperlocal</h1>
            <p className="text-xs text-gray-500">Ad Optimizer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {businessName || "Mike's Coffee Shop"}
            </p>
            <p className="text-xs text-gray-500">mike@coffeeshop.com</p>
          </div>
        </div>
        
        {onLogout && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout}
            className="w-full justify-start text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </aside>
  );
}
