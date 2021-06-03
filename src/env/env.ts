export const env = Object.freeze({
    PORT: 8443,
    MONGO_URL: "mongodb://127.0.0.1:27017",
    MONGO_DATABASE: "wms",
    JWT_PUBLIC_KEY: "src/env/jwt.pub",
    JWT_PRIVATE_KEY: "src/env/jwt.key",
    LOGIN_ROUTE: "/login",
    SIGNUP_ROUTE: "/signup",
    OOBE_ROUTE: "/oobe",
    COMPANY_ROUTE: "/company",
    ITEM_ROUTE: "/item",
    CART_ROUTE: "/cart"
})