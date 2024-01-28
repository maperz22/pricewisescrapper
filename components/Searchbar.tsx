"use client"

import {FormEvent, useState} from "react";
import {scrapeAndStoreProduct} from "@/lib/actions";

const isValidAmazonProductURL = (url : string) => {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        if (
            hostname.includes("amazon.com") ||
            hostname.includes("amazon.") ||
            hostname.endsWith("amazon")
        ) {
            return true;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

const Searchbar = () => {
    const [searchPromt, setSearchPromt] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event : FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const isValideUrl = isValidAmazonProductURL(searchPromt);

        if (!isValideUrl) {
            return alert("Please enter a valid Amazon product URL");
        }

        try {
            setIsLoading(true);

            const product = await scrapeAndStoreProduct(searchPromt);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }

    }


    return (
        <form
            className="flex flex-wrap gap-4 mt-12"
            onSubmit={handleSubmit}
        >
            <input
                type="text"
                value={searchPromt}
                onChange={(e) => setSearchPromt(e.target.value)}
                placeholder="Enter product link"
                className="searchbar-input"
            />
            <button
                type="submit"
                disabled={searchPromt === "" || isLoading}
                className="searchbar-btn"
            >
                {isLoading ? "Loading..." : "Search"}
            </button>
        </form>
    );
};

export default Searchbar;
