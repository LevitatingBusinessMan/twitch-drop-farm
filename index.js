const puppeteer = require('puppeteer');

const readline = require('readline');

const usernames = []
const passwords = [];

(async () => {
	const browser = await puppeteer.launch({headless: false});
	const context = await browser.createIncognitoBrowserContext();

	for (let i = 0; i < usernames.length; i++) {
		await watchStream(usernames[i], passwords[i])
	}

	console.log("All watching")

	function watchStream(username, password) {
		
		return new Promise(async resolve => {

			const page = await context.newPage();
			await page.goto('https://www.twitch.tv/anomaly');
			
			 page.evaluate(() => {document.querySelector("[data-test-selector=\"anon-user-menu__login-button\"]").click()})
			
			await page.waitForSelector("[aria-label=\"Enter your username\"]")
			
			await page.evaluate(() => document.querySelector("[aria-label=\"Enter your username\"]").select())
		
			for (const char of username) {
				await page.keyboard.sendCharacter(char)
			}
		
			await page.evaluate(() => document.querySelector("[aria-label=\"Enter your password\"]").select())
		
			for (const char of password) {
				await page.keyboard.sendCharacter(char)
			}
		
			await page.evaluate(() => document.querySelector("[data-a-target=\"passport-login-button\"]").click())
		
			console.log("waiting 3 seconds to login")
			await wait(3000);
		
			//Check if we need a verification key
			if (await page.$("[aria-label=\"Verification code input\"]") !== null) {
				const rl = readline.createInterface({
					input: process.stdin,
					output: process.stdout
				});
		
				rl.question(`Verification code for ${username}:`, async code => {
					await page.evaluate(() => document.querySelector(".tw-pd-r-1 input").select())
					for (const char of code) {
						await page.keyboard.sendCharacter(char)
					}
					console.log(username, "should be set");
					resolve()
				})
			}
			else {
				console.log(username, "should be set");
				resolve()
			}

		})

	}

})();

async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}
