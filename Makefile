
tts.js: tts.ts package-lock.json
	tsc

package-lock.json:
	npm install

test: package-lock.json tts.js
	node -e 'require("./test").test()'
