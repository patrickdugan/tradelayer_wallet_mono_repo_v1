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
exports.LtcInstantTrade = void 0;
var receiver_1 = require("./receiver");
var events_1 = require("../common/enums/events");
var tl_api_1 = require("../common/tl-api");
var LtcInstantTrade = /** @class */ (function (_super) {
    __extends(LtcInstantTrade, _super);
    function LtcInstantTrade(host, trade, options) {
        return _super.call(this, host, trade, options) || this;
    }
    LtcInstantTrade.prototype.initTrade = function () {
        this.log("Init LTC Instant Trade !");
        this.handleSubListeners();
        this.socket.emit(events_1.Events1.COMMIT_TO_CHANNEL);
    };
    LtcInstantTrade.prototype.handleSubListeners = function () {
        this.socket.on(events_1.Events2.COMMIT_TX, this.onCommitTx.bind(this));
    };
    LtcInstantTrade.prototype.onCommitTx = function (commitTx) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var msus, rus, bltcitData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.log("Received Listener Commit TX: " + commitTx);
                        this.commitsTx = [commitTx];
                        if (!((_a = this.multySigChannelData) === null || _a === void 0 ? void 0 : _a.address))
                            return [2 /*return*/, this.terminateTrade("Can't Find multisig Channel Address")];
                        if (!this.trade.address)
                            return [2 /*return*/, this.terminateTrade("Can't Find Receiver Address")];
                        return [4 /*yield*/, this.listUnspent(this.multySigChannelData.address)];
                    case 1:
                        msus = _b.sent();
                        return [4 /*yield*/, this.listUnspent(this.trade.address)];
                    case 2:
                        rus = _b.sent();
                        if (!(msus === null || msus === void 0 ? void 0 : msus.length) || !(rus === null || rus === void 0 ? void 0 : rus.length))
                            return [2 /*return*/];
                        return [4 /*yield*/, this._buildLTCInstantTrade(msus, rus)];
                    case 3:
                        bltcitData = _b.sent();
                        this.socket.emit(events_1.Events1.RAWTX_FOR_SIGNING, bltcitData);
                        return [2 /*return*/];
                }
            });
        });
    };
    LtcInstantTrade.prototype._buildLTCInstantTrade = function (msus, rus) {
        return __awaiter(this, void 0, void 0, function () {
            var bbData, trade, propertyid, amount, price, address, cpitLTCOptions, cpitRes, vins, bttt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log("Building LTC Instant Trade");
                        return [4 /*yield*/, this.getBestBlock(10)];
                    case 1:
                        bbData = _a.sent();
                        trade = this.trade;
                        propertyid = trade.propertyid, amount = trade.amount, price = trade.price, address = trade.address;
                        cpitLTCOptions = [propertyid, amount, price, bbData];
                        return [4 /*yield*/, tl_api_1.api.createPayload_instantTrade_LTC.apply(tl_api_1.api, cpitLTCOptions)];
                    case 2:
                        cpitRes = _a.sent();
                        if (cpitRes.error || !cpitRes.data)
                            return [2 /*return*/, this.terminateTrade(cpitRes.error)];
                        this.log("Created Instat Trade payload: " + cpitRes.data);
                        vins = msus.map(function (us) { return ({ txid: us.txid, vout: us.vout }); });
                        return [4 /*yield*/, tl_api_1.api.buildTokenTokenTrade(vins, cpitRes.data, address)];
                    case 3:
                        bttt = _a.sent();
                        if (bttt.error || !bttt.data)
                            return [2 /*return*/, this.terminateTrade(cpitRes.error || 'Error with Creating the Payload')];
                        this.log("Created RawTx: " + bttt.data);
                        return [2 /*return*/, bttt.data];
                }
            });
        });
    };
    return LtcInstantTrade;
}(receiver_1.Receiver));
exports.LtcInstantTrade = LtcInstantTrade;
