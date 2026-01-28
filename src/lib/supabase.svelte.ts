import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '$lib/schema';

export type AuthorizationStatus = boolean | null;

export const LSK_SB_URL: string = 'svk-supabase-url';
export const LSK_SB_ANON_KEY: string = 'svk-supabase-anon-key';
export const LSK_SB_USER_EMAIL: string = 'svk-supabase-user-email';

class Supabase {
    private authorized: AuthorizationStatus = $state(null);
    private clientReady: boolean = $state(false);
    private client: SupabaseClient<Database> | null = null;
    private userEmail: string = localStorage.getItem(LSK_SB_USER_EMAIL) ?? '';

    public get isAuthorized() : AuthorizationStatus {
        return this.authorized;
    }

    public get isClientReady() : boolean {
        return this.clientReady;
    }

    public get sbClient() : SupabaseClient<Database> {
        if (this.client === null) {
            throw new TypeError('Supabase client must be created before accessing.');
        }
        return this.client;
    }

    public async init(callback: (status: AuthorizationStatus) => Promise<void>) {
        let status: AuthorizationStatus = null;
        if (this.client === null) {
            const sbUrl = localStorage.getItem(LSK_SB_URL) ?? '';
            const sbAnonKey = localStorage.getItem(LSK_SB_ANON_KEY) ?? '';
            if (sbUrl.length === 0 || sbAnonKey.length === 0 || this.userEmail.length === 0) {
                status = false;
            }
            try {
                this.client = createClient(sbUrl, sbAnonKey);
                this.clientReady = true;
            } catch (e) {
                status = false;
            }
        }
        if (this.client !== null) {
            try {
                status = (await this.client.auth.getUser()).data.user !== null;
            } catch (e) {
                status = false;
            }
        }
        await callback(status);
        this.authorized = status;
    }

    public async resetClient(url: string, anonKey: string, userEmail: string) : Promise<boolean> {
        try {
            await this.forceLogout(false);
            this.client = createClient(url, anonKey);
            this.clientReady = true;
            this.userEmail = userEmail;
            return true;
        } catch (e) {
            return false;
        }
    }

    public async login(password: string) : Promise<AuthorizationStatus> {
        try {
            this.authorized = (await this.sbClient.auth.signInWithPassword({ email: this.userEmail, password })).data.user !== null;
            return this.authorized;
        } catch (e) {
            this.authorized = false;
            return false;
        }
    }

    public async forceLogout(reload: boolean = false) {
        await this.client?.auth.signOut();
        if (reload) {
            location.reload();
        }
    }
}

export const supabase = new Supabase();