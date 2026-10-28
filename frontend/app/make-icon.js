const sharp = require("sharp");

(async () => {
  const src = "public/infosware-logo.png";
  const { height } = await sharp(src).metadata();

  await sharp(src)
    .extract({ left: 0, top: 0, width: Math.round(height * 0.53), height })
    .resize(256, 256, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toFile("app/icon.png");

  console.log("app/icon.png created");
})();