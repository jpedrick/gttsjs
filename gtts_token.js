var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "utf8", "request-promise-native"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const utf8 = require("utf8");
    const request = require("request-promise-native");
    function _rshift(a, d) {
        return a >= 0 ? a >> d : (a + 0x100000000) >> d;
    }
    function _work_token(a, seed) {
        var r = a;
        for (var i = 0; i < seed.length - 2; i += 3) {
            const c = seed[i + 2];
            const d = c > 'a' ? +c - 87 : +c;
            const e = seed[i + 1] == '+' ? _rshift(r, d) : r << d;
            r = seed[i] == '+' ? r + e & 4294967295 : r ^ d;
        }
        return r;
    }
    class Token {
        constructor() {
            this.SALT_1 = "+-a^+6";
            this.SALT_2 = "+-3^+b+-f";
            this.token_key = null;
        }
        calculate_token(text, seed) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('seed: ' + seed);
                if (seed == null) {
                    seed = yield this._get_token_key();
                    console.log('got seed from token_key: ' + seed);
                }
                if (seed) {
                    const split_seed = seed.split(".");
                    var first_seed = +split_seed[0];
                    var second_seed = +split_seed[1];
                    var d = Array.from(utf8.encode(text));
                    var a = first_seed | 0;
                    d.map(v => { a += +v; a = _work_token(a, this.SALT_1); });
                    a = _work_token(a, this.SALT_2);
                    a ^= second_seed;
                    if (a <= 0) {
                        a = (a & 0x8fff) + 0x8ffe;
                    }
                    a %= 1e6;
                    console.log('a:' + a + ' first_seed:' + first_seed + ' a^first_seed:' + (a ^ first_seed));
                    return String(a) + "." + String(a ^ first_seed);
                }
                return null;
            });
        }
        _get_token_key() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.token_key != null) {
                    return this.token_key;
                }
                const response = yield request.get({ uri: 'https://translate.google.com/' });
                const tkk_expr = response.match("(tkk:.*?),");
                const result = tkk_expr[1].match(/\d+\.\d+/)[0];
                this.token_key = result;
                return this.token_key;
            });
        }
    }
    exports.Token = Token;
    var tkn = new Token();
    const key = tkn._get_token_key().then(key => {
        console.log("TokenKey: '" + key + "'");
    });
    tkn.calculate_token("hello world hello hello hello", null).then(function (tkn) {
        console.log("Token: '" + tkn + "'");
    });
});
//# sourceMappingURL=gtts_token.js.map