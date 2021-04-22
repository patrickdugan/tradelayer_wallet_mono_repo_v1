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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
var ltc_client_1 = require("./ltc_client");
var asyncClient = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                        try {
                            ltc_client_1.ltc_client.cmd.apply(ltc_client_1.ltc_client, __spreadArray(__spreadArray([], args), [function (error, data) {
                                    var result = { error: null, data: null };
                                    if (error)
                                        result.error = error.message;
                                    if (data)
                                        result.data = data;
                                    resolve(result);
                                }]));
                        }
                        catch (error) {
                            resolve(error.message);
                        }
                    })];
                case 1: return [2 /*return*/, (_a.sent())];
            }
        });
    });
};
exports.api = {};
// Litecoin RPC APIs
exports.api.getInfo = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient("tl_getinfo")];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.getNewAddress = function (account) {
    if (account === void 0) { account = null; }
    return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, asyncClient("getnewaddress", account)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    }); });
};
exports.api.validateAddress = function (address) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient("validateaddress", address)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.simpleSignRawTx = function (tx) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient("signrawtransaction", tx)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.sendrawtransaction = function (tx) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient('sendrawtransaction', tx)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.getBestBlockHash = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient('getbestblockhash')];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.getBlockHash = function (block) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient('getblockhash', block)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.getBlock = function (hash) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient('getblock', hash)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.listunspent = function (min, max, channelsArray) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 9999999; }
    if (channelsArray === void 0) { channelsArray = null; }
    return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, asyncClient("listunspent", min, max, channelsArray)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    }); });
};
exports.api.addMultisigAddress = function (n, pubkeysArray) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient("addmultisigaddress", n, pubkeysArray)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.fundrawtransaction = function (tx, options) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient('fundrawtransaction', tx, options)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
// TradeLayer RPC APIs
exports.api.tl_gettransaction = function (tx) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient("tl_gettransaction", tx)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.createPayload_instantTrade = function (id1, amount1, id2, amount2, expiryBlockHeight) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient('tl_createpayload_instant_trade', id1, amount1, id2, amount2, expiryBlockHeight)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.createPayload_instantTrade_LTC = function (id, amount, ltc, expiryBlockHeight) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient('tl_createpayload_instant_ltc_trade', id, amount, ltc, expiryBlockHeight)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.commitToChannel = function (sendingAddress, channelAddress, propertyid, amount) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient("tl_commit_tochannel", sendingAddress, channelAddress, propertyid, amount)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.api.getchannel_info = function (address) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, asyncClient("tl_getchannel_info", address)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
// Complex RPC APIs
exports.api.getBestBlock = function () { return __awaiter(void 0, void 0, void 0, function () {
    var bestBlockHashResult, bestBlockHashError, bestBlockHashData, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.api.getBestBlockHash()];
            case 1:
                bestBlockHashResult = _b.sent();
                bestBlockHashError = bestBlockHashResult.error;
                bestBlockHashData = bestBlockHashResult.data;
                if (!bestBlockHashError) return [3 /*break*/, 2];
                _a = bestBlockHashResult;
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, exports.api.getBlock(bestBlockHashData)];
            case 3:
                _a = _b.sent();
                _b.label = 4;
            case 4: return [2 /*return*/, _a];
        }
    });
}); };
exports.api.buildTokenTokenTrade = function (vins, payload, firstAddress, secondAddress) { return __awaiter(void 0, void 0, void 0, function () {
    var tl_createrawtx_inputAll, crtxiRes, crtxrRes, crtxoRes, frtRes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(vins === null || vins === void 0 ? void 0 : vins.length) || !payload || !firstAddress || !secondAddress)
                    return [2 /*return*/, { error: 'Missing vins, payload or ChangeAddress' }];
                tl_createrawtx_inputAll = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var hex, _i, vins_1, vin, crtxiRes_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                hex = '';
                                _i = 0, vins_1 = vins;
                                _a.label = 1;
                            case 1:
                                if (!(_i < vins_1.length)) return [3 /*break*/, 4];
                                vin = vins_1[_i];
                                return [4 /*yield*/, asyncClient('tl_createrawtx_input', hex, vin.txid, vin.vout)];
                            case 2:
                                crtxiRes_1 = _a.sent();
                                if (crtxiRes_1.error || !crtxiRes_1.data)
                                    return [2 /*return*/, { error: 'Error with creating raw tx' }];
                                hex = crtxiRes_1.data;
                                _a.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/, { data: hex }];
                        }
                    });
                }); };
                return [4 /*yield*/, tl_createrawtx_inputAll()];
            case 1:
                crtxiRes = _a.sent();
                if (crtxiRes.error || !crtxiRes.data)
                    return [2 /*return*/, { error: 'Error with creating raw tx' }];
                return [4 /*yield*/, asyncClient('tl_createrawtx_reference', crtxiRes.data, secondAddress)];
            case 2:
                crtxrRes = _a.sent();
                if (crtxrRes.error || !crtxrRes.data)
                    return [2 /*return*/, { error: 'Error with adding referance address' }];
                return [4 /*yield*/, asyncClient('tl_createrawtx_opreturn', crtxrRes.data, payload)];
            case 3:
                crtxoRes = _a.sent();
                if (crtxoRes.error || !crtxoRes.data)
                    return [2 /*return*/, { error: 'Error with adding payload' }];
                return [4 /*yield*/, asyncClient('fundrawtransaction', crtxoRes.data, { changeAddress: firstAddress, changePosition: 0 })];
            case 4:
                frtRes = _a.sent();
                if (frtRes.error || !frtRes.data)
                    return [2 /*return*/, { error: 'Error with Funding the RawTX' }];
                return [2 /*return*/, frtRes];
        }
    });
}); };
exports.api.buildLTCInstantTrade = function (vins, payload, changeAddress, price, refAddress) { return __awaiter(void 0, void 0, void 0, function () {
    var tl_createrawtx_inputAll, crtxiRes, crtxrRes, crtxoRes, frtRes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(vins === null || vins === void 0 ? void 0 : vins.length) || !payload || !refAddress || !price || !changeAddress)
                    return [2 /*return*/, { error: 'Missing argumetns for building LTC Instant Trade' }];
                tl_createrawtx_inputAll = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var hex, _i, vins_2, vin, crtxiRes_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                hex = '';
                                _i = 0, vins_2 = vins;
                                _a.label = 1;
                            case 1:
                                if (!(_i < vins_2.length)) return [3 /*break*/, 4];
                                vin = vins_2[_i];
                                return [4 /*yield*/, asyncClient('tl_createrawtx_input', hex, vin.txid, vin.vout)];
                            case 2:
                                crtxiRes_2 = _a.sent();
                                if (crtxiRes_2.error || !crtxiRes_2.data)
                                    return [2 /*return*/, { error: 'Error with creating raw tx' }];
                                hex = crtxiRes_2.data;
                                _a.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/, { data: hex }];
                        }
                    });
                }); };
                return [4 /*yield*/, tl_createrawtx_inputAll()];
            case 1:
                crtxiRes = _a.sent();
                if (crtxiRes.error || !crtxiRes.data)
                    return [2 /*return*/, { error: 'Error with creating raw tx' }];
                return [4 /*yield*/, asyncClient('tl_createrawtx_reference', crtxiRes.data, refAddress, price)];
            case 2:
                crtxrRes = _a.sent();
                if (crtxrRes.error || !crtxrRes.data)
                    return [2 /*return*/, { error: crtxrRes.error || 'Error with adding referance address' }];
                return [4 /*yield*/, asyncClient('tl_createrawtx_opreturn', crtxrRes.data, payload)];
            case 3:
                crtxoRes = _a.sent();
                if (crtxoRes.error || !crtxoRes.data)
                    return [2 /*return*/, { error: 'Error with adding payload' }];
                return [4 /*yield*/, asyncClient('fundrawtransaction', crtxoRes.data, { changeAddress: changeAddress, changePosition: 0 })];
            case 4:
                frtRes = _a.sent();
                if (frtRes.error || !frtRes.data)
                    return [2 /*return*/, { error: 'Error with Funding the RawTX' }];
                return [2 /*return*/, frtRes];
        }
    });
}); };
