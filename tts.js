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
        define(["require", "exports", "request-promise-native"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const request = require("request-promise-native");
    const GOOGLE_TTS_MAX_CHARS = 100;
    const GOOGLE_TTS_URL = "https://translate.google.com/translate_tts";
    const GOOGLE_TTS_HEADERS = {
        "Referer": "http://translate.google.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
        "Content-Type": 'Application/json'
    };
    class GTTS {
        constructor(lang = 'en-in', speed = 1.0) {
            this.lang = 'en-in';
            this.speed = 1.0;
            this.token = null;
            this.speed = speed;
            this.token = new Token();
            this.lang = lang;
        }
        uri(text) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.token) {
                    const tk = yield this.token.calculate_token(text, null);
                    if (tk) {
                        const payload = {
                            ie: 'UTF-8',
                            q: text,
                            textlen: text.length,
                            tl: this.lang,
                            ttsspeed: Math.max(Math.min(this.speed, 1.0), 0.0),
                            total: 1,
                            idx: 0,
                            client: 'tw-ob',
                            tk: tk
                        };
                        // @ts-ignore
                        const params = Object.keys(payload).map(k => k + '=' + String(payload[k])).join('&');
                        const fulluri = [GOOGLE_TTS_URL, params].join('?');
                        return fulluri;
                    }
                }
                return null;
            });
        }
    }
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
                    //var d = Array.from( utf8.encode( text ) );
                    var d = Array.from(text);
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
});
//# sourceMappingURL=tts.js.map