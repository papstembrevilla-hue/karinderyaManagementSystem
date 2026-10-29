import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ClipboardList,
    LayoutGrid,
    Tags,
    Truck,
    Users,
    Utensils,
    UtensilsCrossed,
} from 'lucide-react';
import AppLogo from './app-logo';

/*
|--------------------------------------------------------------------------
| Regular User Navigation
|--------------------------------------------------------------------------
*/

const userNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

/*
|--------------------------------------------------------------------------
| Administrator Navigation
|--------------------------------------------------------------------------
*/

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Orders',
        url: '/admin/orders',
        icon: ClipboardList,
    },
    {
        title: 'Food Management',
        url: '/admin/menu-items',
        icon: UtensilsCrossed,
    },
    {
        title: 'Categories',
        url: '/admin/categories',
        icon: Tags,
    },
    {
        title: 'Ingredients',
        url: '/admin/ingredients',
        icon: Utensils,
    },
    {
        title: 'Suppliers',
        url: '/admin/suppliers',
        icon: Truck,
    },
    {
        title: 'Stock In',
        url: '/admin/stock-ins',
        icon: ArrowDownToLine,
    },
    {
        title: 'Stock Out',
        url: '/admin/stock-outs',
        icon: ArrowUpFromLine,
    },
    {
        title: 'Customers',
        url: '/customers',
        icon: Users,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const isAdmin = auth.user.role === 'admin';

    const mainNavItems = isAdmin
        ? adminNavItems
        : userNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    isAdmin
                                        ? '/admin/dashboard'
                                        : '/dashboard'
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
