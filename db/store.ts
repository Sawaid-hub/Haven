import {env} from '@/lib/runtime';
export function database(){if(!env.DB)throw new Error('Property storage is unavailable');return env.DB;}
