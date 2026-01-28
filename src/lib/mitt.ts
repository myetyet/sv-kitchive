import mitt from 'mitt';

import type { InventoryItem } from './schema';

type Events = {
    'ui:navbar': 'show' | 'hide',
    'inventory:changed': { type: 'add' | 'delete' | 'update'; index: number; item: InventoryItem },
    'calendar:today': undefined,
};

export const emitter = mitt<Events>();