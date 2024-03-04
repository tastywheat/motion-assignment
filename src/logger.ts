

function log(message: string) {
    const date = new Date().toISOString();
    console.log(JSON.stringify({
        date,
        message,
    }));
}

function logError(message: string) {
    const date = new Date().toISOString();
    console.error(JSON.stringify({
        date,
        message,
    }));
}


export default log;
