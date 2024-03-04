import fetch from 'node-fetch';

import configs from './configs';
import log from './logger';

const FB_URL = `https://graph.facebook.com/v19.0/me?access_token=${configs.fbKey}`;

async function app() {
    log('Starting');

    const data = await fetchUserInfo();
    console.log('data', data);
}

async function fetchUserInfo() {
    const params = new URLSearchParams({
        fields: `id,name`,
    });

    const res = await fetch(`${FB_URL}&${params}`);

    return res.json();
}

app();
