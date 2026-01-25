type Empty = { [_ in never]: never };

export type StoragePlace = 0 | 1 | 2;

export type InventoryItem = {
    uid: string,
    name: string,
    place: StoragePlace,
    expired_at: string | null,
    quantity: number | null
}

export interface Database {
    public: {
        Tables: {
            svktv_dishes: {
                Row: {
                    date: string;
                    dishes: string[];
                    count: number;
                };
                Insert: {
                    date: string;
                    dishes?: string[] | null;
                    count?: never;
                };
                Update: {
                    date: string;
                    dishes?: string[] | null;
                    count?: never;
                };
                Relationships: never[];
            };
            svktv_inventory: {
                Row: InventoryItem;
                Insert: {
                    uid?: never;
                    name: string;
                    place: StoragePlace;
                    expired_at?: string | null;
                    quantity?: number | null;
                };
                Update: {
                    uid?: never;
                    name: string;
                    place?: never;
                    expired_at?: string | null;
                    quantity?: number | null;
                };
                Relationships: never[];
            };
        };
        Views: Empty;
        Functions: Empty;
    };
}