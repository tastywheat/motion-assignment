

const logger = {
    info: (message: string) => {
        const date = new Date().toISOString();
        console.log(JSON.stringify({
            date,
            type: 'info',
            message,
        }));
    },
    error: (message: string) => {
        const date = new Date().toISOString();
        console.error(JSON.stringify({
            date,
            type: 'error',
            message,
        }));
    },
};


export default logger;
