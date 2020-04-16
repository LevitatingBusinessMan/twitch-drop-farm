const puppeteer = require('puppeteer')
const readline = require('readline')
const fs = require("fs")

const tokens = require("./tokens")

const headless = !process.argv.includes("--headless-off")
const screenshot = process.argv.includes("--screenshot")

const pageUrl = "https://www.twitch.tv/anomaly"

;(async () => {
	const browser = await puppeteer.launch({headless})

	for (let user in tokens) {
		const token = tokens[user]
		await watchStream(user, token)
	}

	const startDate = new Date()
	
	console.log()
	setInterval(() => {
	
		process.stdout.clearLine()
	
		let str = `Watching ${pageUrl} for `
	
		const time = (new Date()).getTime() - startDate.getTime()
	
		const milsInHour = 60 * 60 * 1000
		const milsInMinute = 60 * 1000
	
		const hours = Math.floor(time / milsInHour)
		const minutes = Math.floor(time % milsInHour / milsInMinute)
	
		if (hours)
			str += `${hours} hours and `
		
		str += `${hours} minutes`
	
		process.stdout.write(str)
		process.stdout.cursorTo(0)
	
	}, 1000)

	function watchStream(user, token) {

		return new Promise(async resolve => {

			console.log(`Attempting to login ${user}...`)
			const page = await browser.newPage();
			page.setCookie({ name: "auth-token", value: token, domain: "www.twitch.tv" })
			await page.goto(pageUrl)

			if (await page.$("[data-test-selector=\"anon-user-menu__login-button\"]") !== null)
				console.log("\033[31;1mLevitating1:\033[0;31m did not login, is the token correct?\033[0m")
			else console.log("\033[32;1mLevitating1:\033[0;32m Logged in!\033[0m")

			if (screenshot) {
				if (!fs.existsSync("./screenshots")) {
					fs.mkdirSync("./screenshots");
				}

				page.screenshot({ path: `./screenshots/${user}.png` }).then(() => {
					console.log("Screenshot made for", user)
				})
			}

			resolve()

		})

	}

})();

async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}
