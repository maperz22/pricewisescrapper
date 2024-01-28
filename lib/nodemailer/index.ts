import nodemailer from 'nodemailer';
import {EmailContent, EmailProductInfo, NotificationType} from "@/types";

export const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET',
}

export const generateEmailBody = (product: EmailProductInfo, type: NotificationType) => {
    const shortenedTitle = product.title.length > 20
        ? product.title.substring(0, 20) + '...'
        : product.title;

    let subject = '';
    let body = '';

    switch (type) {
        case Notification.WELCOME:
            subject = `Welcome to Amazon Price Tracker!`;
            body = `
                <div>
                    <p>Hi there, thanks for signing up to Amazon Price Tracker!</p>
                    <p>Here's the product you're tracking:</p>
                    <ul>
                        <li>Title: ${product.title}</li>
                        <li>URL: ${product.url}</li>
                        <li>Lowest Price: ${product.lowestPrice}</li>
                    </ul>
                    <p>Thanks,</p>
                    <p>Amazon Price Tracker</p>
                </div>`;
            break;

        case Notification.CHANGE_OF_STOCK:
            subject = `Change of stock for ${shortenedTitle}`;
            body = `
                <div>
                    <p>Hi there, just letting you know that the stock for ${product.title} has changed.</p>
                    <p>Here's the product you're tracking:</p>
                    <ul>
                        <li>Title: ${product.title}</li>
                        <li>URL: ${product.url}</li>
                        <li>Lowest Price: ${product.lowestPrice}</li>
                    </ul>
                    <p>Thanks,</p>
                    <p>Amazon Price Tracker</p>
                </div>`;
            break;

        case Notification.LOWEST_PRICE:
            subject = `Lowest price for ${shortenedTitle}`;
            body = `
                <div>
                    <p>Hi there, just letting you know that the price for ${product.title} has dropped to ${product.lowestPrice}.</p>
                    <p>Here's the product you're tracking:</p>
                    <ul>
                        <li>Title: ${product.title}</li>
                        <li>URL: ${product.url}</li>
                        <li>Lowest Price: ${product.lowestPrice}</li>
                    </ul>
                    <p>Thanks,</p>
                    <p>Amazon Price Tracker</p>
                </div>`;
            break;

        case Notification.THRESHOLD_MET:
            subject = `Threshold met for ${shortenedTitle}`;
            body = `
            
                <div>
                    <p>Hi there, just letting you know that the price for ${product.title} has dropped below your threshold price.</p>
                    <p>Here's the product you're tracking:</p>
                    <ul>
                        <li>Title: ${product.title}</li>
                        <li>URL: ${product.url}</li>
                        <li>Lowest Price: ${product.lowestPrice}</li>
                    </ul>
                    <p>Thanks,</p>
                    <p>Amazon Price Tracker</p>
                </div>`;
            break;

        default:
            throw new Error('Invalid notification type');
    }

    return {
        subject,
        body
    }

}

const transporter = nodemailer.createTransport({
    port: Number(process.env.EMAIL_PORT),
    host: process.env.EMAIL_HOST,
    service: process.env.EMAIL_SERVICE,
    pool: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: true
    },
    maxConnections: 1
});

export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: sendTo,
        subject: emailContent.subject,
        html: emailContent.body
    };

    try {
        await transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
                console.log('Error sending email', error);
            } else {
                console.log('Email sent', info);
            }

        });
        console.log('Email sent');
    } catch (error) {
        console.log('Error sending email', error);
    }
}