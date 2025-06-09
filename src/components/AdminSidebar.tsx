
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Activity,
  Scale 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Usuários', href: '/admin/users', icon: Users },
  { name: 'Casos', href: '/admin/cases', icon: FileText },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
  { name: 'Logs', href: '/admin/logs', icon: Activity },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col fixed inset-y-0 z-50 bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Scale className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold text-primary">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
