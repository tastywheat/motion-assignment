import type { Config } from './types';

const fbKey = process.env.FB_KEY;
if (!fbKey) throw new Error('environment variable FB_KEY is required');

const config: Config = {
    fbKey,
}

export default config;
