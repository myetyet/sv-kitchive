import { CalendarDaysIcon, CookingPotIcon, RefrigeratorIcon, SettingsIcon } from '@lucide/svelte';

export const routes = [
    { label: '日历', url: '/menus', icon: CalendarDaysIcon },
    { label: '库存', url: '/inventory', icon: RefrigeratorIcon },
    { label: '菜谱', url: '/recipes', icon: CookingPotIcon },
    { label: '设置', url: '/settings', icon: SettingsIcon },
];