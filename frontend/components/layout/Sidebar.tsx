'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import {
  LayoutDashboard,
  Folder,
  FileText,
  Wallet,
  Layers,
  Lock,
  BarChart3,
  Vault,
  Users,
  AlertTriangle,
  ArrowUpCircle,
  BadgeCheck,
  FileBarChart,
  Receipt,
  Gauge,
  Code2,
  Webhook,
  ClipboardList,
  ShieldAlert,
  Activity,
  Shield,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Projects', href: '/dashboard/projects', icon: Folder },
      { name: 'Payments', href: '/dashboard/payments', icon: Wallet },
      { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
      { name: 'Batch Payments', href: '/dashboard/batch', icon: Layers },
      { name: 'Escrow', href: '/dashboard/escrow', icon: Lock },
    ],
  },
  {
    label: 'Risk & Compliance',
    items: [
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Vaults', href: '/dashboard/vaults', icon: Vault },
      { name: 'Multi-Sig', href: '/dashboard/multisig', icon: Users },
      { name: 'Disputes', href: '/dashboard/disputes', icon: AlertTriangle },
      { name: 'Escalation', href: '/dashboard/escalation', icon: ArrowUpCircle },
      { name: 'Verification', href: '/dashboard/verification', icon: BadgeCheck },
      { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
      { name: 'Tax Reports', href: '/dashboard/tax-reports', icon: Receipt },
      { name: 'Rate Limits', href: '/dashboard/rate-limits', icon: Gauge },
    ],
  },
  {
    label: 'Developers',
    items: [
      { name: 'Developers', href: '/dashboard/developers', icon: Code2 },
      { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
      { name: 'Forms', href: '/dashboard/forms', icon: ClipboardList },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Admin', href: '/dashboard/admin', icon: ShieldAlert },
      { name: 'Monitoring', href: '/dashboard/monitoring', icon: Activity },
      { name: 'Security', href: '/dashboard/security', icon: Shield },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { name, email, address } = useAuthStore();

  const initials =
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  const identityLabel = email || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected');

  return (
    <>
      <aside
        id="sidebar-navigation"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-6 border-b border-sidebar-border">
            <div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-amber-500 flex items-center justify-center"
              role="img"
              aria-label="ManifestPay logo"
            >
              <Wallet className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">ManifestPay</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.label}>
                <h2 className="px-4 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive =
                      item.href === '/dashboard'
                        ? pathname === item.href
                        : pathname === item.href || pathname?.startsWith(item.href + '/');

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-accent-foreground/10'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon
                          className={cn('h-4.5 w-4.5', isActive ? 'text-sidebar-accent-foreground' : 'text-muted-foreground')}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent/40"
              role="region"
              aria-label="User information"
            >
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-amber-400 flex items-center justify-center text-white font-semibold shrink-0"
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{identityLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
