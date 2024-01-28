"use server"

import {revalidatePath} from "next/cache";
import {scrapeAmazonProducts} from "@/lib/scraper";
import {connectToDatabase} from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import {getAveragePrice, getHighestPrice, getLowestPrice} from "@/lib/utils";
import ProductModel from "@/lib/models/product.model";
import {EmailContent, User} from "@/types";
import {generateEmailBody, sendEmail} from "@/lib/nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) {
    throw new Error("No product URL provided")
  }

  try {
    await connectToDatabase()

    const scrapedProduct = await scrapeAmazonProducts(productUrl)

    if (!scrapedProduct) throw new Error("No product found")

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({url: product.url});

    if (existingProduct) {
      const updatedPriceHistory: any = [...existingProduct.priceHistory, {price: product.currentPrice}]
      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      }
    }

    console.log(product)

    const newProduct = await Product.findOneAndUpdate(
        { url: scrapedProduct.url },
        product,
        {new: true, upsert: true} // upsert: true creates a new document if no document matches the query
    );

    revalidatePath(`/products/${newProduct._id}`)

  } catch (error) {
    throw new Error(`Error scraping product: ${error}`)
  }

}

export async function getProductById(productId: string) {

  try {
    await connectToDatabase()

    const product = await Product.findOne({_id: productId});

    if (!product) throw new Error("No product found")

    return product;

  } catch (error) {
    throw new Error(`Error fetching product: ${error}`)
  }

}

export async function getAllProducts() {
  try {
    await connectToDatabase()
    return await Product.find({})
  } catch (error) {
    throw new Error(`Error fetching products: ${error}`)
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    await connectToDatabase()

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) throw new Error("No product found")

    return await Product.find({
        _id: {$ne: productId},
        category: currentProduct.category
    }).limit(3);

  } catch (error) {
    throw new Error(`Error fetching products: ${error}`)
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}