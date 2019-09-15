
tts.js: tts.ts package-lock.json
	tsc tts.ts

package-lock.json:
	npm install

test: package-lock.json tts.js
	node -e 'require("./tts").test()'
