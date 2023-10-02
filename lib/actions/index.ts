// Have to configure the next.config.js file to do this 
// Usually all pages are server sided by default, need to check if I need to manually apply this to libs files
"use server";

import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(productUrl: string) {
	// if no product url then exit
	if (!productUrl) return;

	try {
		const scrapedProduct = await scrapeAmazonProduct(productUrl);
	} catch (error: any) {
		throw new Error(`Failed to create/update product: ${error.message}`);
	}
}
