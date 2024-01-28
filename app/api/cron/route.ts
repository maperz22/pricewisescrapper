import Product from "@/lib/models/product.model";
import { connectToDatabase } from "@/lib/mongoose";
import {Promise} from "mongoose";
import {scrapeAmazonProducts} from "@/lib/scraper";
import {getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice} from "@/lib/utils";
import {EmailProductInfo} from "@/types";
import {generateEmailBody, sendEmail} from "@/lib/nodemailer";
import {NextResponse} from "next/server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {

    try {
        await connectToDatabase();

        const products = await Product.find({});

        if (!products) throw new Error("No products found");

        const updatedProducts = Promise.all(
            products.map(async (currentProduct) => {
                const scrapedProduct = await scrapeAmazonProducts(currentProduct.url);
                if (!scrapedProduct) throw new Error("No product found");

                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    {price: scrapedProduct.currentPrice}
                ];

                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
                };

                const updatedProduct = await Product.findOneAndUpdate(
                    {url: scrapedProduct.url},
                    product,
                );

                const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct);

                if (emailNotifType && updatedProduct.users.length > 0) {
                    const productInfo: EmailProductInfo = {
                        title: scrapedProduct.title,
                        url: scrapedProduct.url,
                        lowestPrice: getLowestPrice(updatedPriceHistory),
                    };

                    const emailContent = generateEmailBody(productInfo, emailNotifType);

                    const userEmails = updatedProduct.users.map((user: any) => user.email);

                    await sendEmail(emailContent, userEmails);
                }
                return updatedProduct;
            }));

    return NextResponse.json({
            message: "Ok",
            data: updatedProducts,
    });
    } catch (error) {
        throw new Error(`Error fetching products: ${error}`);
    }

}
