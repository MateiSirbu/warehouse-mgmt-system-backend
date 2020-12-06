import * as https from "https";
import * as fs from "fs";
const { env } = require("./env/env");
const { init } = require("./app");

let privateKey = fs.readFileSync("src/env/server.key");
let certificate = fs.readFileSync("src/env/server.crt");

let app = init()
let server = https.createServer({ key: privateKey, cert: certificate }, app);
console.log(`Server listening on port ${env.PORT}`)
server.listen(env.PORT)