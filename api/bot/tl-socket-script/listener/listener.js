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
exports.ListenerServer = void 0;
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var events_1 = require("../common/enums/events");
var tradeTypes_1 = require("../common/enums/tradeTypes");
var tl_api_1 = require("../common/tl-api");
var ListenerServer = /** @class */ (function () {
    function ListenerServer(address, port, options) {
        this.init(port);
        this.serverOptions = { address: address, options: options };
    }
    ListenerServer.prototype.close = function () {
        this.io.close();
    };
    ListenerServer.prototype.init = function (port) {
        console.log("Start Listener Server on port " + port);
        var httpServer = http_1.createServer();
        var socketOptions = { cors: { origin: "*", methods: ["GET", "POST"] } };
        httpServer.listen(port);
        this.io = new socket_io_1.Server(httpServer, socketOptions);
        this.io.on("connection", this.onConnection.bind(this));
    };
    ListenerServer.prototype.onConnection = function (socket) {
        new Listener(socket, this.serverOptions);
    };
    return ListenerServer;
}());
exports.ListenerServer = ListenerServer;
var Listener = /** @class */ (function () {
    function Listener(socket, server) {
        this.logs = false;
        this.socket = socket,
            this.logs = server.options.logs;
        this.listenerAddress = server.address;
        this.init();
    }
    Listener.prototype.close = function () {
        this.socket.disconnect();
    };
    Listener.prototype.log = function (message, data) {
        if (this.logs)
            console.log(message + " " + (JSON.stringify(data, null, "\t") || ''));
    };
    Listener.prototype.init = function () {
        this.log("New Connection: ID " + this.socket.id);
        this.handleListeners();
    };
    Listener.prototype.handleListeners = function () {
        this.socket.on(events_1.Events1.TRADE_REQUEST, this.onTradeRequest.bind(this));
        this.socket.on(events_1.Events1.CHANNEL_PUB_KEY, this.onChannelPubKey.bind(this));
        this.socket.on(events_1.Events1.COMMIT_TO_CHANNEL, this.onCommitToChannel.bind(this));
        this.socket.on(events_1.Events1.RAWTX_FOR_SIGNING, this.onRawTxForSigning.bind(this));
    };
    Listener.prototype.rejectTrade = function (reason) {
        this.log("Trade Rejected! " + reason);
        this.socket.emit(events_1.Events2.REJECT_TRADE, 'Rejection Reason');
    };
    Listener.prototype.terminateTrade = function (reason) {
        if (reason === void 0) { reason = 'No info'; }
        this.log("Trade Terminated! " + reason);
        this.socket.emit(events_1.Events2.TERMINATE_TRADE, reason);
    };
    Listener.prototype.initNewTrade = function (trade) {
        return __awaiter(this, void 0, void 0, function () {
            var gnaRes, gnaData, vaRes, vaData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log("Init New Trade!");
                        this.log("Creating New Address");
                        return [4 /*yield*/, tl_api_1.api.getNewAddress()];
                    case 1:
                        gnaRes = _a.sent();
                        if (gnaRes.error || !gnaRes.data)
                            return [2 /*return*/, this.terminateTrade(gnaRes.error)];
                        gnaData = gnaRes.data;
                        this.log("Created New Address " + gnaData);
                        this.log("Validating Address");
                        return [4 /*yield*/, tl_api_1.api.validateAddress(gnaRes.data)];
                    case 2:
                        vaRes = _a.sent();
                        if (vaRes.error || !vaRes.data)
                            return [2 /*return*/, this.terminateTrade(vaRes.error)];
                        vaData = vaRes.data;
                        this.listenerChannelPubKey = vaData.pubkey;
                        this.socket.emit(events_1.Events2.CHANNEL_PUB_KEY, vaData);
                        this.log("Valid Address. Pubkey: " + vaData.pubkey);
                        return [2 /*return*/];
                }
            });
        });
    };
    // onMethods
    Listener.prototype.onTradeRequest = function (trade) {
        this.log("Trade Request:", trade);
        this.trade = trade;
        var isValid = true;
        isValid ? this.initNewTrade(trade) : this.rejectTrade('Bad Trade');
    };
    Listener.prototype.onChannelPubKey = function (pubkey) {
        return __awaiter(this, void 0, void 0, function () {
            var pubKeys, amaRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!pubkey)
                            this.terminateTrade("No pubKey Received");
                        this.log("Received PubKey: " + pubkey);
                        this.receiverChannelPubKey = pubkey;
                        this.log("Creating MultySig Address");
                        pubKeys = [this.listenerChannelPubKey, this.receiverChannelPubKey];
                        return [4 /*yield*/, tl_api_1.api.addMultisigAddress(2, pubKeys)];
                    case 1:
                        amaRes = _a.sent();
                        if (amaRes.error || !amaRes.data)
                            return [2 /*return*/, this.terminateTrade(amaRes.error)];
                        this.multySigChannelData = amaRes.data;
                        this.socket.emit(events_1.Events2.MULTYSIG_DATA, amaRes.data);
                        this.log("Created MultySig Address:", amaRes.data);
                        return [2 /*return*/];
                }
            });
        });
    };
    Listener.prototype.onCommitToChannel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var type, tttrade, ltciTrade, commitData, ctcRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log("Commiting Tokens to Channel");
                        type = this.trade.type;
                        switch (type) {
                            case tradeTypes_1.TradeTypes.TOKEN_TOKEN_TRADE:
                                tttrade = this.trade;
                                this.comId = tttrade.propertydesired;
                                this.comAmount = tttrade.amountdesired;
                                break;
                            case tradeTypes_1.TradeTypes.LTC_INSTANT_TRADE:
                                ltciTrade = this.trade;
                                this.comId = ltciTrade.propertyid;
                                this.comAmount = ltciTrade.amount;
                                break;
                            default:
                                break;
                        }
                        if (!this.comId || !this.comAmount)
                            return [2 /*return*/, this.terminateTrade('Error with Commiting the Tokens')];
                        commitData = [
                            this.listenerAddress,
                            this.multySigChannelData.address,
                            this.comId,
                            this.comAmount,
                        ];
                        return [4 /*yield*/, tl_api_1.api.commitToChannel.apply(tl_api_1.api, commitData)];
                    case 1:
                        ctcRes = _a.sent();
                        if (ctcRes.error || !ctcRes.data)
                            return [2 /*return*/, this.terminateTrade(ctcRes.error)];
                        this.listenerCommitTx = ctcRes.data;
                        this.socket.emit(events_1.Events2.COMMIT_TX, ctcRes.data);
                        this.log("Commit Channel Tx: " + ctcRes.data + ". ID: " + this.comId + ", amount: " + this.comAmount);
                        return [2 /*return*/];
                }
            });
        });
    };
    Listener.prototype.onRawTxForSigning = function (rawTx) {
        return __awaiter(this, void 0, void 0, function () {
            var ssrtxRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!rawTx)
                            return [2 /*return*/, this.terminateTrade('No RawTx for Signing Provided!')];
                        this.log("Signing Raw TX: " + rawTx);
                        return [4 /*yield*/, tl_api_1.api.simpleSignRawTx(rawTx)];
                    case 1:
                        ssrtxRes = _a.sent();
                        if (ssrtxRes.error || !ssrtxRes.data)
                            return [2 /*return*/, this.terminateTrade(ssrtxRes.error)];
                        if (!ssrtxRes.data.complete || !ssrtxRes.data.hex)
                            return [2 /*return*/, this.terminateTrade("Error with Signing Raw TX")];
                        this.socket.emit(events_1.Events2.SIGNED_RAWTX, ssrtxRes.data.hex);
                        this.log("Signed Raw TX: " + ssrtxRes.data.hex);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Listener;
}());
