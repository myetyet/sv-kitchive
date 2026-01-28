import type { Component } from 'svelte';
import type { Pathname } from '$app/types';

import { CalendarDaysIcon, CookingPotIcon, RefrigeratorIcon, SettingsIcon, type IconProps } from '@lucide/svelte';

export const routes: { label: string; url: Pathname; icon: Component<IconProps, {}, ""> }[] = [
    { label: '日历', url: '/menus', icon: CalendarDaysIcon },
    { label: '库存', url: '/inventory', icon: RefrigeratorIcon },
    { label: '菜谱', url: '/recipes', icon: CookingPotIcon },
    { label: '设置', url: '/settings', icon: SettingsIcon },
];