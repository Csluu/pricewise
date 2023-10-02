// Have to configure the next.config.js file to do this
// Usually all pages are server sided by default, need to check if I need to manually apply this to libs files
"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(productUrl: string) {
	// if no product url then exit
	if (!productUrl) return;

	try {
		connectToDB();

		const scrapedProduct = await scrapeAmazonProduct(productUrl);
		if (!scrapedProduct) return;

		let product = scrapedProduct;

		const existingProduct = await Product.findOne({ url: scrapedProduct.url });

		if (existingProduct) {
			const updatedPriceHistory: any = [
				...existingProduct.priceHistory,
				{ price: scrapedProduct.currentPrice },
			];

			product = {
				...scrapedProduct,
				priceHistory: updatedPriceHistory,
				lowestPrice: getLowestPrice(updatedPriceHistory),
				highestPrice: getHighestPrice(updatedPriceHistory),
				averagePrice: getAveragePrice(updatedPriceHistory),
			};
		}
		// filter by url then update the product if its a new url then create one in the database
		const newProduct = await Product.findOneAndUpdate(
			{
				url: scrapedProduct.url,
			},
			product,
			{ upsert: true, new: true }
		);

		// have to revalidate the page as nextjs will just load from cache
		revalidatePath(`./products/${newProduct._id}`);
	} catch (error: any) {
		throw new Error(`Failed to create/update product: ${error.message}`);
	}
}

export async function getProductByID(productID: string) {
	try {
		connectToDB();

		const product = await Product.findOne({ _id: productID });

		if (!product) return null;

		return product;
	} catch (error) {
		console.log(error);
	}
}

export async function getAllProducts() {
	try {
		connectToDB();

		const products = await Product.find();
		return products;
	} catch (error) {
		console.log(error);
	}
}
