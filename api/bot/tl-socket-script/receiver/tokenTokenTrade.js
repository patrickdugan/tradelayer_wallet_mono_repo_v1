"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.TokenTokenTrade = void 0;
var receiver_1 = require("./receiver");
var events_1 = require("../common/enums/events");
var tl_api_1 = require("../common/tl-api");
var TokenTokenTrade = /** @class */ (function (_super) {
    __extends(TokenTokenTrade, _super);
    function TokenTokenTrade(host, trade, options, send) {
        return _super.call(this, host, trade, options, send) || this;
    }
    TokenTokenTrade.prototype.initTrade = function () {
        this.log("Init Token/Token Trade !");
        this.handleSubListeners();
        this.socket.emit(events_1.Events1.COMMIT_TO_CHANNEL);
    };
    TokenTokenTrade.prototype.handleSubListeners = function () {
        this.socket.on(events_1.Events2.COMMIT_TX, this.onCommitTx.bind(this));
    };
    TokenTokenTrade.prototype.onCommitTx = function (commitTx) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, address, propertyid, amount, msAddress, commitData, ctcData, msus, btttData;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.log("Received Listener Commit TX: " + commitTx);
                        _b = this.trade, address = _b.address, propertyid = _b.propertyid, amount = _b.amount;
                        msAddress = this.multySigChannelData.address;
                        if (!address || !propertyid || !amount)
                            return [2 /*return*/, this.terminateTrade('Error with Provided Trade Information')];
                        if (!((_a = this.multySigChannelData) === null || _a === void 0 ? void 0 : _a.address))
                            return [2 /*return*/, this.terminateTrade("Can't Find multisig Channel Address")];
                        commitData = [address, msAddress, propertyid, amount];
                        return [4 /*yield*/, this.commitToChannel(commitData)];
                    case 1:
                        ctcData = _c.sent();
                        if (!ctcData)
                            return [2 /*return*/, this.terminateTrade('Error with Commiting Tokens to Multsig Channel!')];
                        this.commitsTx = [commitTx, ctcData];
                        return [4 /*yield*/, this.listUnspent(this.multySigChannelData.address)];
                    case 2:
                        msus = _c.sent();
                        if (!msus || msus.length < 2)
                            return [2 /*return*/, this.terminateTrade('Error with Founding 2 Unspents!')];
                        return [4 /*yield*/, this._bildTokenTokenTrade(msus)];
                    case 3:
                        btttData = _c.sent();
                        this.socket.emit(events_1.Events1.RAWTX_FOR_SIGNING, btttData);
                        return [2 /*return*/];
                }
            });
        });
    };
    TokenTokenTrade.prototype._bildTokenTokenTrade = function (unspents) {
        return __awaiter(this, void 0, void 0, function () {
            var bbData, trade, propertyid, amount, propertydesired, amountdesired, address, gci, cpitOptions, cpitRes, vins, bttt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log("Building Token/Token Trade");
                        return [4 /*yield*/, this.getBestBlock(10)];
                    case 1:
                        bbData = _a.sent();
                        this.log("Creating Instat Trade payload");
                        trade = this.trade;
                        propertyid = trade.propertyid, amount = trade.amount, propertydesired = trade.propertydesired, amountdesired = trade.amountdesired, address = trade.address;
                        return [4 /*yield*/, tl_api_1.api.getchannel_info(address)];
                    case 2:
                        gci = _a.sent();
                        if (gci.error || !gci.data)
                            return [2 /*return*/, this.terminateTrade(gci.error || 'Error with Getting Multisig Channel info')];
                        cpitOptions = [propertyid, amount, propertydesired, amountdesired, bbData];
                        return [4 /*yield*/, tl_api_1.api.createPayload_instantTrade.apply(tl_api_1.api, cpitOptions)];
                    case 3:
                        cpitRes = _a.sent();
                        if (cpitRes.error || !cpitRes.data)
                            return [2 /*return*/, this.terminateTrade(cpitRes.error || 'Error with Creating the Payload')];
                        this.log("Created Instat Trade payload: " + cpitRes.data);
                        vins = unspents.map(function (us) { return ({ txid: us.txid, vout: us.vout, scriptPubKey: us.scriptPubKey, value: us.amount }); });
                        return [4 /*yield*/, tl_api_1.api.buildTokenTokenTrade(vins, cpitRes.data, address)];
                    case 4:
                        bttt = _a.sent();
                        if (bttt.error || !bttt.data)
                            return [2 /*return*/, this.terminateTrade(cpitRes.error || 'Error with Creating the Payload')];
                        this.log("Created RawTx: " + bttt.data);
                        return [2 /*return*/, bttt.data];
                }
            });
        });
    };
    return TokenTokenTrade;
}(receiver_1.Receiver));
exports.TokenTokenTrade = TokenTokenTrade;
