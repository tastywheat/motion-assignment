import type { Config } from './types';


const config = require(`./${process.env.NODE_ENV}`);


export default config.default as Config;

