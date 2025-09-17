'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Youtube, 
  BarChart3, 
  Gift, 
  FileText, 
  Upload 
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/creator', icon: Home },
  { name: 'Verification', href: '/creator/verification', icon: Youtube },
  { name: 'Analytics', href: '/creator/analytics', icon: BarChart3 },
  { name: 'Incentives', href: '/creator/incentives', icon: Gift },
  { name: 'Contract', href: '/creator/contract', icon: FileText },
  { name: 'Submissions', href: '/creator/submissions', icon: Upload },
];

export default function CreatorSidebar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 h-screen w-64 bg-white border-r border-orange-100 flex flex-col">
      <div className="p-6 border-b border-orange-100">
        <h2 className="text-xl font-semibold text-gray-900">Creator Hub</h2>
        <p className="text-sm text-gray-600 mt-1">Jharkhand Tourism</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 relative
                ${isActive 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-700 hover:bg-orange-50/50 hover:text-orange-600'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full" />
              )}
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}