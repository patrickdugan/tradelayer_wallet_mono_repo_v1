"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receiver = void 0;
var socket_io_client_1 = require("socket.io-client");
var events_1 = require("../common/enums/events");
var tl_api_1 = require("../common/tl-api");
var Receiver = /** @class */ (function () {
    function Receiver(host, trade, options) {
        this.logs = false;
        this.logs = options.logs;
        this.trade = trade;
        this.init(host);
        this.onReady();
    }
    Receiver.prototype.init = function (host) {
        // const socketOptions = { 'reconnection': false }
        this.socket = socket_io_client_1.io(host);
        this.socket.on('connect', this.onConnection.bind(this));
    };
    Receiver.prototype.close = function () {
        this.socket.close();
    };
    Receiver.prototype.onReady = function () {
        var _this = this;
        return new Promise(function (res, rej) {
            _this.readyRes = res;
            _this.readyRej = rej;
        });
    };
    Receiver.prototype.sendRawTx = function () {
        return __awaiter(this, void 0, void 0, function () {
            var srtxRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log("Start Sending Raw Tx if its readey!");
                        if (!this.signedRawTx)
                            return [2 /*return*/, { error: 'There is no Raw TX ready for sending!' }];
                        return [4 /*yield*/, tl_api_1.api.sendRawTx(this.signedRawTx)];
                    case 1:
                        srtxRes = _a.sent();
                        if (srtxRes.error || !srtxRes.data)
                            return [2 /*return*/, this.terminateTrade(srtxRes.error)];
                        this.log("Transaction Sended: " + srtxRes.data);
                        return [2 /*return*/, srtxRes];
                }
            });
        });
    };
    Receiver.prototype.log = function (message, data) {
        if (this.logs)
            console.log(message + " " + (JSON.stringify(data, null, "\t") || ''));
    };
    Receiver.prototype.onConnection = function () {
        this.log("Connected");
        this.handleListeners();
        this.sendTradeRequest();
    };
    Receiver.prototype.handleListeners = function () {
        this.socket.on(events_1.Events2.REJECT_TRADE, this.onTradeReject.bind(this));
        this.socket.on(events_1.Events2.TERMINATE_TRADE, this.onTradeTerminate.bind(this));
        this.socket.on(events_1.Events2.CHANNEL_PUB_KEY, this.onChannelPubKey.bind(this));
        this.socket.on(events_1.Events2.MULTYSIG_DATA, this.onMultisigData.bind(this));
        this.socket.on(events_1.Events2.SIGNED_RAWTX, this.onSignedRawTx.bind(this));
    };
    Receiver.prototype.sendTradeRequest = function () {
        this.socket.emit(events_1.Events1.TRADE_REQUEST, this.trade);
    };
    Receiver.prototype.terminateTrade = function (reason) {
        if (reason === void 0) { reason = 'No info'; }
        var error = "Trade Terminated! " + reason;
        this.log(error);
        if (this.readyRej)
            this.readyRes({ error: error });
        this.close();
        return { error: error };
    };
    Receiver.prototype.legitMultySig = function (pubKeys, redeemScript) {
        return __awaiter(this, void 0, void 0, function () {
            var amaRes, legitRedeemScript;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log("Legiting Multysig");
                        return [4 /*yield*/, tl_api_1.api.addMultisigAddress(2, pubKeys)];
                    case 1:
                        amaRes = _a.sent();
                        if (amaRes.error || !amaRes.data) {
                            this.terminateTrade(amaRes.error);
                            return [2 /*return*/, false];
                        }
                        legitRedeemScript = amaRes.data.redeemScript;
                        return [2 /*return*/, redeemScript === legitRedeemScript];
                }
            });
        });
    };
    //On Methods
    Receiver.prototype.onTradeReject = function (reason) {
        var message = "Trade Rejected!! Reason: " + reason;
        this.terminateTrade(message);
    };
    Receiver.prototype.onTradeTerminate = function (reason) {
        var message = "Trade Terminated!! Reason: " + reason;
        this.terminateTrade(message);
    };
    Receiver.prototype.onChannelPubKey = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var gnaRes, gnaData, vaResult, vaData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!data.pubkey || !data.address)
                            this.terminateTrade("No pubKey Received");
                        this.log("Received PubKey: " + data.pubkey);
                        this.listenerChannelPubKey = data.pubkey;
                        this.log("Creating New Address");
                        return [4 /*yield*/, tl_api_1.api.getNewAddress()];
                    case 1:
                        gnaRes = _a.sent();
                        if (gnaRes.error || !gnaRes.data)
                            return [2 /*return*/, this.terminateTrade(gnaRes.error)];
                        gnaData = gnaRes.data;
                        this.log("Created New Address " + gnaData);
                        this.log("Validating Address");
                        return [4 /*yield*/, tl_api_1.api.validateAddress(gnaData)];
                    case 2:
                        vaResult = _a.sent();
                        if (vaResult.error || !vaResult.data)
                            return [2 /*return*/, this.terminateTrade(vaResult.error)];
                        vaData = vaResult.data;
                        this.receiverChannelPubKey = vaData.pubkey;
                        this.socket.emit(events_1.Events1.CHANNEL_PUB_KEY, vaData.pubkey);
                        this.log("Valid Address. Pubkey: " + vaData.pubkey);
                        return [2 /*return*/];
                }
            });
        });
    };
    Receiver.prototype.onMultisigData = function (multisigData) {
        return __awaiter(this, void 0, void 0, function () {
            var pubKeys, isValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!multisigData)
                            this.terminateTrade("No pubKey Received");
                        this.log("Received MultisigData:", multisigData);
                        pubKeys = [this.listenerChannelPubKey, this.receiverChannelPubKey];
                        return [4 /*yield*/, this.legitMultySig(pubKeys, multisigData.redeemScript)];
                    case 1:
                        isValid = _a.sent();
                        this.log("Received MultySig Address " + (isValid ? 'IS' : "IS NOT") + " valid!");
                        if (!isValid)
                            return [2 /*return*/, this.terminateTrade('Wrong MyltySig Data Provided!')];
                        this.multySigChannelData = multisigData;
                        this.initTrade();
                        return [2 /*return*/];
                }
            });
        });
    };
    Receiver.prototype.initTrade = function () {
        return this.terminateTrade("Not found Init Function");
    };
    Receiver.prototype.onSignedRawTx = function (rawTx) {
        return __awaiter(this, void 0, void 0, function () {
            var ssrtxRes, srt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!rawTx)
                            return [2 /*return*/, this.terminateTrade('No RawTx for Signing Provided!')];
                        this.log("Received Signed RawTx and start co-signing rawTx: " + rawTx);
                        return [4 /*yield*/, tl_api_1.api.simpleSignRawTx(rawTx)];
                    case 1:
                        ssrtxRes = _a.sent();
                        if (ssrtxRes.error || !ssrtxRes.data)
                            return [2 /*return*/, this.terminateTrade(ssrtxRes.error)];
                        if (!ssrtxRes.data.complete || !ssrtxRes.data.hex)
                            return [2 /*return*/, this.terminateTrade("Error with Signing Raw TX")];
                        this.log("Final co-signed Raw TX: " + ssrtxRes.data.hex);
                        this.signedRawTx = ssrtxRes.data.hex;
                        this.close();
                        return [4 /*yield*/, tl_api_1.api.sendrawtransaction(this.signedRawTx)];
                    case 2:
                        srt = _a.sent();
                        if (srt.error || !srt.data)
                            return [2 /*return*/, this.terminateTrade(srt.error)];
                        console.log("Sender Raw TX: " + srt.data);
                        this.commitsTx && this.signedRawTx && this.trade && srt.data
                            ? this.readyRes({ data: { commits: this.commitsTx, rawTx: this.signedRawTx, trade: this.trade, tx: srt.data } })
                            : this.readyRes({ error: 'Something Wrong' });
                        return [2 /*return*/];
                }
            });
        });
    };
    Receiver.prototype.listUnspent = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var lusRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log("Getting unspent address: " + address);
                        if (!address)
                            return [2 /*return*/, this.terminateTrade("Can't Find Address for listunspent")];
                        return [4 /*yield*/, tl_api_1.api.listunspent(0, 9999999, [address])];
                    case 1:
                        lusRes = _a.sent();
                        if (lusRes.error || !lusRes.data)
                            return [2 /*return*/, this.terminateTrade(lusRes.error)];
                        if (lusRes.data.length < 1)
                            return [2 /*return*/, this.terminateTrade("Not found usnepnds for the address " + address)];
                        this.log("Unspents for multySig Address length: " + lusRes.data.length);
                        return [2 /*return*/, lusRes.data];
                }
            });
        });
    };
    Receiver.prototype.commitToChannel = function (commitOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var ctcRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tl_api_1.api.commitToChannel.apply(tl_api_1.api, commitOptions)];
                    case 1:
                        ctcRes = _a.sent();
                        if (ctcRes.error || !ctcRes.data)
                            return [2 /*return*/, this.terminateTrade(ctcRes.error)];
                        this.log("Commit Channel Tx: " + ctcRes.data + ". ID: " + commitOptions[2] + ", amount: " + commitOptions[3]);
                        return [2 /*return*/, ctcRes.data];
                }
            });
        });
    };
    Receiver.prototype.getBestBlock = function (n) {
        return __awaiter(this, void 0, void 0, function () {
            var bbRes, height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log("Getting Best Block");
                        return [4 /*yield*/, tl_api_1.api.getBestBlock()];
                    case 1:
                        bbRes = _a.sent();
                        if (bbRes.error || !bbRes.data || !bbRes.data.height)
                            return [2 /*return*/, this.terminateTrade(bbRes.error || "Error with getting best block")];
                        height = bbRes.data.height + n;
                        this.log("Best Block: " + bbRes.data.height + " - exp.Block : " + height);
                        return [2 /*return*/, height];
                }
            });
        });
    };
    return Receiver;
}());
exports.Receiver = Receiver;
