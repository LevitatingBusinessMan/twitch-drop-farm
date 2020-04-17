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
		.then(() => console.log("\033[32;1m" + user + ":\033[0;32m Logged in!\033[0m"))
		.catch(() => console.log("\033[31;1m" + user + ":\033[0;31m did not login, is the token correct?\033[0m"))
	}

	(await browser.pages())[0].close()

	setTimeout(() => startTimer(), 1000)

	function watchStream(user, token) {

		return new Promise(async (resolve, reject) => {

			console.log(`Attempting to login ${user}...`)
			
			const context = await browser.createIncognitoBrowserContext()

			const page = await context.newPage();
			
			
			// Another way of ensuring no cookies are left
			/* const client = await page.target().createCDPSession();
			await client.send('Network.clearBrowserCookies');
			await client.send('Network.clearBrowserCache'); */

			await page.setCookie({ name: "auth-token", value: token, domain: ".twitch.tv" })
			await page.goto(pageUrl)

			res = await await page.waitForResponse("https://gql.twitch.tv/gql")
			
			if (!res.ok()) {
				page.close()
				return reject()
			}

			resolve()

			if (screenshot) {
				if (!fs.existsSync("./screenshots")) {
					fs.mkdirSync("./screenshots");
				}

				page.screenshot({ path: `./screenshots/${user}.png` }).then(() => {
					console.log("Screenshot made for", user)
				})
			}

			//Update cookies
  			page.cookies().then(cookies => {
				for (cookie of cookies) {
					if (cookie.name == "auth-token" && cookie.value != token) {
						tokens[user] = cookie.value
						console.log("Updating token for ", user)
						fs.writeFile("./tokens.json", JSON.stringify(tokens))
					}
				}
			}) 

		})

	}

})();

function startTimer() {

	const startDate = new Date()
	
	console.log()
	setInterval(() => {
	
		process.stdout.clearLine()
	
		let str = `Watching ${"\033[35m" + pageUrl + "\033[0m"} for `
	
		const time = (new Date()).getTime() - startDate.getTime()
	
		const milsInHour = 60 * 60 * 1000
		const milsInMinute = 60 * 1000
	
		const hours = Math.floor(time / milsInHour)
		const minutes = Math.floor(time % milsInHour / milsInMinute)
	
		if (hours)
			str += `${hours} hours and `
		
		str += `${minutes} minutes`
	
		process.stdout.write(str)
		process.stdout.cursorTo(0)
	
	}, 1000)

}
