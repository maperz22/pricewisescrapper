import React from 'react';
import {getProductById, getSimilarProducts} from "@/lib/actions";
import {redirect} from "next/navigation";
import {Product} from "@/types";
import Image from "next/image";
import Link from "next/link";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import Modal from "@/components/Modal";

type Props = {
    params: {
        id: string;
    }
}

const ProductDetails = async ({ params } : Props) => {
    const product : Product = await getProductById(params.id);

    if(!product) redirect('/')

    const similarProducts = await getSimilarProducts(params.id);

    return (
        <div className="product-container">
            <div className="flex gap-28 xl:flex-row flex-col">
                <div className="product-image">
                    <Image
                        src={product.image}
                        alt={product.title}
                        width={580}
                        height={400}
                        className="mx-auto"
                    />
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap flex-wrap pb-6">
                        <div className="flex flex-col gap-3 pb-5">
                            <p className="text-[30px] text-secondary font-semibold">
                                {product.title}
                            </p>
                            <Link
                                href={product.url}
                                target={"_blank"}
                                className="text-[18px] text-black opacity-50"
                            >
                                Vist Product
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="product-hearts" >
                                <Image
                                    src="/assets/icons/red-heart.svg"
                                    alt="Heart"
                                    width={24}
                                    height={24}
                                />

                                <p className="text-base font-semibold text-[#D46F77]" >
                                    {product.reviewsCount}
                                </p>
                            </div>
                            <div className="p-2 bg-white-200 rounded-10" >
                                <Image
                                    src="/assets/icons/bookmark.svg"
                                    alt="Bookmark"
                                    width={24}
                                    height={24}
                                />
                            </div>
                            <div className="p-2 bg-white-200 rounded-10" >
                                <Image
                                    src="/assets/icons/share.svg"
                                    alt="Share"
                                    width={24}
                                    height={24}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="product-info">
                        <div className="flex flex-col gap-2">
                            <p className="text-[34px] text-secondary font-bold">
                                {product.currentPrice} {product.currency}
                            </p>
                            <p className="text-[21px] text-black line-through opacity-50">
                                {product.originalPrice} {product.currency}
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-3">
                                <div className="product-stars">
                                    <Image
                                        src="/assets/icons/star.svg"
                                        alt="Star"
                                        width={18}
                                        height={18}
                                    />
                                    <p className="text-sm text-primary-orange font-semibold">
                                        {product.stars || "24"}
                                    </p>
                                </div>
                                <div className="product-reviews">
                                    <Image
                                        src="/assets/icons/comment.svg"
                                        alt="Comment"
                                        width={16}
                                        height={16}
                                    />
                                    <p className="text-sm text-secondary font-semibold">
                                        {product.reviewsCount} Reviews
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-black opacity-50">
                                <span className="text-primary-green font-semibold">93% </span> of buyers enjoyed this product!
                            </p>
                        </div>
                    </div>
                    <div className="my-7 flex-col gap-5">
                        <div className="flex gap-5 flex-wrap">
                            <PriceInfoCard
                                title="Current Price"
                                iconSrc="/assets/icons/price-tag.svg"
                                value={`${product.currentPrice} ${product.currency}`}
                            />
                            <PriceInfoCard
                                title="Avrage Price"
                                iconSrc="/assets/icons/chart.svg"
                                value={`${product.averagePrice} ${product.currency}`}
                            />
                            <PriceInfoCard
                                title="Highest Price"
                                iconSrc="/assets/icons/arrow-up.svg"
                                value={`${product.highestPrice} ${product.currency}`}
                            />
                            <PriceInfoCard
                                title="Lowest Price"
                                iconSrc="/assets/icons/arrow-down.svg"
                                value={`${product.lowestPrice} ${product.currency}`}
                            />
                        </div>
                    </div>
                    <Modal productId={params.id} />
                </div>
            </div>
            <div className="flex flex-col gap-16 ">
                <div className="flex flex-col gap-5">
                    <h3 className="text-2xl text-secondary font-semibold">
                        Product Details
                    </h3>
                    <div className="flex flex-col gap-4">
                        {product?.description.split('\n')}
                    </div>
                </div>
                <button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
                    <Image
                        src="/assets/icons/bag.svg"
                        alt="Check"
                        width={24}
                        height={24}
                    />
                    <Link href={"/"} className="text-base text-white">
                        Buy Now
                    </Link>
                </button>
            </div>
            {similarProducts?.length > 0 && (
                <div className="py-14 flex flex-col gap-2 w-full">
                    <p className="section-text">Similar Products</p>
                    <div className="flex flex-wrap gap-10 mt-7 w-full">
                        {similarProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
