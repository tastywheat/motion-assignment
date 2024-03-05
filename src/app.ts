import configs from './configs';
import logger from './logger';
import { makeLogUserData } from './domain/log-user-data';
import { fetchUserInfo } from './data/fetch-user-info';


const logUserData = makeLogUserData({
    minDelay: configs.minDelay, 
    maxDelay: configs.maxDelay, 
    fetchUserInfo,
});

async function app() {
    logger.info('Starting');

    let delay = configs.minDelay;
    while(true) {
        await sleep(delay);
        delay = await logUserData({
            fields: ['id', 'name'],
            delay,
        });
    }
}

function sleep(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
})

process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception thrown: ${err?.stack}`);
    process.exit(1);
});

export default app;
