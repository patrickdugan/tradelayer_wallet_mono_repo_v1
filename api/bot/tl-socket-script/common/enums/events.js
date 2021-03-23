"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events2 = exports.Events1 = void 0;
var Events1;
(function (Events1) {
    Events1["TRADE_REQUEST"] = "TRADE_REQUEST";
    Events1["CHANNEL_PUB_KEY"] = "CHANNEL_PUB_KEY";
    Events1["COMMIT_TO_CHANNEL"] = "COMMIT_TO_CHANNEL";
    Events1["RAWTX_FOR_SIGNING"] = "RAWTX_FOR_SIGNING";
})(Events1 = exports.Events1 || (exports.Events1 = {}));
var Events2;
(function (Events2) {
    Events2["REJECT_TRADE"] = "REJECT_TRADE";
    Events2["TERMINATE_TRADE"] = "TERMINATE_TRADE";
    Events2["CHANNEL_PUB_KEY"] = "CHANNEL_PUB_KEY";
    Events2["MULTYSIG_DATA"] = "MULTYSIG_DATA";
    Events2["COMMIT_TX"] = "COMMIT_TX";
    Events2["SIGNED_RAWTX"] = "SIGNED_RAWTX";
})(Events2 = exports.Events2 || (exports.Events2 = {}));
