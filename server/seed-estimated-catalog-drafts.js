require("dotenv").config();

const mongoose = require("mongoose");
const ProductPage = require("./models/productPage-model");

const estimateNote =
  "Rough category-level estimate from the image only; exact model, condition, pack size, supplier quote, current market price, and stock are unverified. This draft is not for sale.";

const draftCatalog = [
  {
    img: "uploads/1752734440033.jpg",
    name: "NFC/RFID Coil Tag (model pending)",
    category: "NFC and RFID Tags",
    subCategory: "Coil Tags",
    estimatedPriceMin: 10,
    estimatedPriceMax: 250,
    description: "Image appears to show a small inductive coil tag.",
  },
  {
    img: "uploads/1778484861937-45971244.webp",
    name: "Gray Flat-Brim Cap (brand pending)",
    category: "Apparel",
    subCategory: "Caps",
    estimatedPriceMin: 399,
    estimatedPriceMax: 1999,
    description: "Gray flat-brim cap; brand and material need confirmation.",
  },
  {
    img: "uploads/1778484892701-114584316.jpg",
    name: "Black Smartwatch (model pending)",
    category: "Electronics",
    subCategory: "Wearables",
    estimatedPriceMin: 999,
    estimatedPriceMax: 5999,
    description: "Black smartwatch image; model and functions need confirmation.",
  },
  {
    img: "uploads/1778484911433-258839920.jpg",
    name: "Over-Ear Headphones (model pending)",
    category: "Electronics",
    subCategory: "Headphones",
    estimatedPriceMin: 499,
    estimatedPriceMax: 3999,
    description: "Over-ear headphones; connectivity and model need confirmation.",
  },
  {
    img: "uploads/1778484929685-226568984.jpg",
    name: "Spiked Golf Shoe (brand and size pending)",
    category: "Sports",
    subCategory: "Golf Shoes",
    estimatedPriceMin: 2499,
    estimatedPriceMax: 11999,
    description: "White spiked golf shoe; brand, size, and model need confirmation.",
  },
  {
    img: "uploads/1778582980179-850173466.webp",
    name: "Dell Hybrid Desktop PC (model pending)",
    category: "Computers",
    subCategory: "Desktop PCs",
    estimatedPriceMin: 7999,
    estimatedPriceMax: 34999,
    description: "Image appears to show a Dell Hybrid desktop; model and condition need confirmation.",
  },
  {
    img: "uploads/1780978088257-944620088.png",
    name: "Handheld RFID Reader (model pending)",
    category: "NFC and RFID Readers",
    subCategory: "Handheld Readers",
    estimatedPriceMin: 15000,
    estimatedPriceMax: 75000,
    description: "Handheld device with an integrated reader grip; radio standard and model need confirmation.",
  },
  {
    img: "uploads/1780998675569-344521990.png",
    name: "ACS NFC Reader (model pending)",
    category: "NFC and RFID Readers",
    subCategory: "NFC Readers",
    estimatedPriceMin: 1200,
    estimatedPriceMax: 7000,
    description: "Image is marked NFC and ACS; exact model and supported card types need confirmation.",
  },
  {
    img: "uploads/1781002481323-681857521.png",
    name: "Pair of RFID Coil Tags (model pending)",
    category: "NFC and RFID Tags",
    subCategory: "RFID Labels",
    estimatedPriceMin: 10,
    estimatedPriceMax: 100,
    description: "Image appears to show two circular coil tags; frequency and pack quantity need confirmation.",
  },
  {
    img: "uploads/1781672527476-532822242.png",
    name: "Honeywell Handheld Reader (model pending)",
    category: "NFC and RFID Readers",
    subCategory: "Handheld Readers",
    estimatedPriceMin: 50000,
    estimatedPriceMax: 180000,
    description: "Image appears to show a Honeywell handheld device; exact model and scanner options need confirmation.",
  },
  {
    img: "uploads/1781675388993-190182446.png",
    name: "ACS NFC Reader (alternate image; model pending)",
    category: "NFC and RFID Readers",
    subCategory: "NFC Readers",
    estimatedPriceMin: 1200,
    estimatedPriceMax: 7000,
    description: "Blurry alternate image of an NFC reader; confirm whether this is the same item as the other ACS reader.",
  },
  {
    img: "uploads/1781676784212-732589281.png",
    name: "Round RFID Token (model pending)",
    category: "NFC and RFID Tags",
    subCategory: "RFID Tokens",
    estimatedPriceMin: 10,
    estimatedPriceMax: 250,
    description: "Black round token-like item; material and RFID/NFC compatibility need confirmation.",
  },
  {
    img: "uploads/1781677688124-368646662.jpeg",
    name: "Adhesive Coil Tag (model pending)",
    category: "NFC and RFID Tags",
    subCategory: "RFID Labels",
    estimatedPriceMin: 10,
    estimatedPriceMax: 100,
    description: "Image appears to show an adhesive coil tag; frequency and pack quantity need confirmation.",
  },
  {
    img: "uploads/1781688639363-253904004.png",
    name: "Round RFID Disc (model pending)",
    category: "NFC and RFID Tags",
    subCategory: "RFID Discs",
    estimatedPriceMin: 10,
    estimatedPriceMax: 250,
    description: "Black round disc-like item; exact purpose and reader compatibility need confirmation.",
  },
  {
    img: "uploads/local-catalog-resize-17803015281917499649product2-af3bb3d1.jpg",
    name: "Over-Ear Headphones (possible duplicate; model pending)",
    category: "Electronics",
    subCategory: "Headphones",
    estimatedPriceMin: 499,
    estimatedPriceMax: 3999,
    description: "Headphones image appears to duplicate another listing; confirm whether it is a separate SKU.",
  },
];

const seedDrafts = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Configure server/.env before seeding.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  let updated = 0;
  let skipped = 0;

  for (const item of draftCatalog) {
    const result = await ProductPage.collection.updateOne(
      {
        img: item.img,
        isPlaceholder: true,
        priceVerified: false,
        price: 0,
        $or: [
          { estimatedPriceMin: { $exists: false } },
          { estimatedPriceMin: null },
        ],
      },
      {
        $set: {
          name: item.name,
          category: item.category,
          subCategory: item.subCategory,
          descriptions: item.description,
          productDescription: `${item.description} ${estimateNote}`,
          Brand: "",
          catalogStatus: "draft",
          estimatedPriceMin: item.estimatedPriceMin,
          estimatedPriceMax: item.estimatedPriceMax,
          estimateNote,
          price: 0,
          oldPrice: 0,
          stock: 0,
          stockStatus: "out-of-stock",
          priceVerified: false,
        },
      }
    );

    if (result.modifiedCount === 1) {
      updated += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        draftsUpdated: updated,
        skippedAlreadyCompletedOrNotFound: skipped,
        salePriceAssigned: false,
        stockAssigned: false,
        storefrontPublication: false,
        estimateNote,
      },
      null,
      2
    )
  );
};

seedDrafts()
  .catch((error) => {
    console.error("Estimated catalog draft setup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
