declare namespace NodeJS {
    interface ProcessEnv {
        ACCESS_TOKEN_SECRET: string;
        REFRESH_TOKEN_SECRET: string;
        ACCESS_TOKEN_EXPIRY: `${number}${"s" | "m" | "h" | "d" | "y"}`;
        REFRESH_TOKEN_EXPIRY: `${number}${"s" | "m" | "h" | "d" | "y"}`;
        MONGO_URI: string;
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_API_SECRET: string;
    }
}
