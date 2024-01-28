import axios from "axios";
import * as cheerio from "cheerio";
import {extractPrice} from "@/lib/utils";

export async function scrapeAmazonProducts(url: string) {
    if (!url) return;

    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: "vrd.superproxy.io",
        port,
        rejectUnauthorized: false,
    }

    try {
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        const title = $("#productTitle").text().trim();

        const currentPrice = extractPrice(
            $(".priceToPay span.a-price-color"),
            $("a.size.base.a-color-price"),
            $(".a-button-selected .a-color-base"),
            $(".celwidget > .a-section.a-spacing-none.aok-align-center.aok-relative > .a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span > .a-price-whole"),
            $(".a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span > .a-price-whole"),
        );

        const originalPrice = extractPrice(
            $("#priceblock_ourprice"),
            $(".a-price.a-text-price"),
            $(".priceBlockStrikePriceString"),
        );

        const category = $("#wayfinding-breadcrumbs_feature_div > ul > li:nth-child(1) > span > a").text().trim();

        const stars = $(".reviewCountTextLinkedHistogram.noUnderline").text().trim().split(" ")[0].replace(",", ".");

        const reviewsCount = $("#acrCustomerReviewText").first().text().trim().replace(/[^\d.]/g, '');

        const available = $("#availability > .a-size-medium").text().trim().toLowerCase() === "dostępny";

        const images = $("#landingImage").attr("data-a-dynamic-image") || "{}";

        const imagesUrls = Object.keys(JSON.parse(images));

        const currency = $(".priceToPay span.a-price-symbol").text().trim();
        const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, '');

        const data = {
            url,
            currency: currency || "PLN",
            image: imagesUrls[0],
            title,
            currentPrice: Number(currentPrice),
            originalPrice: Number(originalPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: category || "Other",
            reviewsCount: Number(reviewsCount),
            stars: Number(stars),
            isOutOfStock: !available,
            description: "",
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        }
        return data;
    } catch (error : any) {
        console.log(error)
    }

}