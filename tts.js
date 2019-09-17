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
        define(["require", "exports", "./gtts_token", "request", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const gtts_token = require("./gtts_token");
    const request = require("request");
    const fs = require("fs");
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
            this.token = new gtts_token.Token();
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
        fetch_and_save(text, save_to) {
            return __awaiter(this, void 0, void 0, function* () {
                var uri = yield this.uri(text);
                if (uri) {
                    request.get(uri).pipe(fs.createWriteStream(save_to));
                }
                return null;
            });
        }
    }
    function test() {
        var gtts = new GTTS('en-in', 0.5);
        gtts.fetch_and_save("Ummm, Hello World, hello hello hello", 'hi.mp3');
    }
    exports.test = test;
});
//# sourceMappingURL=tts.js.map