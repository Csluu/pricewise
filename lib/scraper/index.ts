import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeAmazonProduct(url: string) {
	// if no URL then exit
	if (!url) return;

	// BrightData proxy configuration
	const username = String(process.env.BRIGHT_DATA_USERNAME);
	const password = String(process.env.BRIGHT_DATA_PASSWORD);
	// port number is after the io: in the base CURL or can find it in under host in access parameters
	const port = 22225;
	const session_id = (1000000 * Math.random()) | 0;
	const options = {
		auth: {
			username: `${username}-session-${session_id}`,
			password,
		},
		host: "brd.superproxy.io",
		port,
		rejectUnauthorized: false,
	};

	try {
		// Fetch the product page
		const response = await axios.get(url, options);
		// console.log(response.data);
		const $ = cheerio.load(response.data);

		// Extract the product title
		const title = $(`#productTitle`).text().trim();

		console.log({ title });
	} catch (error: any) {
		throw new Error(`Failed to scrape product: ${error.message}`);
	}
}
