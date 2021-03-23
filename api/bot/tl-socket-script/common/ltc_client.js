"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ltc_client = void 0;
var litecoin_1 = require("litecoin");
exports.ltc_client = new litecoin_1.Client({
    host: 'localhost',
    port: 9332,
    user: 'user',
    pass: 'passwrod',
    ssl: false,
});
