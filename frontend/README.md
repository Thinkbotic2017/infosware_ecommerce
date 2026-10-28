This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Local full-stack setup

The storefront uses the Express API on port 5000 and MongoDB. Before starting:

1. Start MongoDB and ensure `server/.env` contains a valid `MONGODB_URI`. For a local database, use `mongodb://127.0.0.1:27017/thinkbotic`. The API also needs a Firebase Admin service-account JSON file at `server/config/serviceAccountKey.json` (or the JSON in `FIREBASE_SERVICE_ACCOUNT` in `server/.env`). Obtain it from the Firebase project owner; this credential is intentionally not in Git.
2. Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000`.

## Infosware storefront branding

The storefront and admin sidebar use the supplied `public/infosware-logo.png` asset. The global blue/orange palette is defined in `app/globals.css`; the header and footer show the Infosware contact details configured in the layout components.

The existing admin panel supports product listing, adding, editing, deleting, and image uploads. After restoring local admin access below, sign in and open `/admin/products` or `/admin/products/add`. Product data is stored in the MongoDB database configured by `MONGODB_URI`.
3. In one terminal, install and start the API:

   ```powershell
   cd server
   npm install
   npm start
   ```

4. In another terminal, install and start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

### Empty local database

If the database was dropped and no backup is available, run `npm run seed:local-catalog` from `server` before starting the API. It adds one category and one clearly marked, unpublished, out-of-stock draft per unique product-like image it finds in `server/uploads` and selected product images in `frontend/public`. The seed is safe to run again and does not overwrite existing products.

Placeholder listings have no sale price or stock and cannot be added to cart or ordered. To publish one, edit it in the admin product page and enter its verified name, category, positive price, and stock. Original names, prices, inventory, banners, and other MongoDB content cannot be reconstructed from image files; restore a database backup or re-enter those details manually.

To label the surviving image records with visual draft descriptions and rough category-level INR price ranges, run `npm run seed:catalog-estimates` from `server`. These estimates are not checked against a supplier quote, exact model, current market listing, pack size, condition, or inventory. The command leaves actual sale prices and stock at zero, marks each record as a draft, and does not publish it. Drafts appear in the authenticated admin product list only; public shop endpoints omit them. Confirm model, product details, price, tax, and stock before saving a completed listing.

The invoice PDF currently in `frontend/public` is image-only. OCR indicates one historical line item, “Yoga Mat Anti-Slip,” at ₹899 each for quantity 2. That item does not match any surviving product image, and the old invoice does not prove today's catalog price or stock, so it is not added to the product catalog. It does not give reliable names or prices for the other images.

Files under `frontend/public` are served directly by Next.js. If this invoice contains customer billing details, remove it from `frontend/public` before deploying the site and keep any required copy in private storage.

### Restoring local admin access

Dropping MongoDB also removed the admin user's `isAdmin` flag. Register the account you own first, then, from the `server` folder, run:

```powershell
npm run admin:promote -- --email your-registered-email@example.com --confirm
```

This command runs locally, requires a registered account and explicit confirmation, and refuses to promote another account if an admin already exists. It does not create a public admin endpoint. Sign out and sign in again, then open `/admin/products/add`. Product-creation APIs remain protected by the admin-role middleware.

A Firebase Admin service-account credential was present in a public frontend folder and was tracked by Git. Its public copy has been removed from the working tree and both credential paths are now ignored; the server's local ignored copy is kept so this checkout can run. Treat the exposed key as compromised: revoke/delete it in Google Cloud IAM, create a replacement, and save the replacement only in `server/config/serviceAccountKey.json` or the ignored `server/.env`. Removing a key from the current checkout does not erase it from existing Git history or remote clones.

For an existing account, sign in using the phone number registered on that account. If the database reset removed its admin role, restore access using the local promotion procedure above; a failed OTP request is not evidence that the account is missing. If OTP sending fails, read the Firebase error shown on the page. In Firebase Console, enable **Authentication → Sign-in method → Phone**, add `localhost` under **Authentication → Settings → Authorized domains**, and check that browser privacy settings/extensions are not blocking reCAPTCHA. Do not share OTPs.

### Completing catalog details

After signing in as the admin, open `/admin/products`. Edit each `Local Catalog Item ... (details pending)` to enter its verified product name, category, selling price, stock, and description; an existing placeholder image can be kept. The product form requires a valid selling price above ₹0 and GST, and accepts an optional MRP. Save to publish the completed listing. If a product's category is not listed, add it at `/admin/category` before saving the product. Do not guess prices, product identities, or stock from an image; use supplier records, invoices, or a verified price list. A new listing can be added from `/admin/products/add` with the same verified fields and a product image.

Admin product-image uploads must be JPG, PNG, or WEBP, 1–500 KB, and 500–800 pixels wide and high. Use the existing placeholder image when that is the only surviving product photo.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
