const Banner = require("../models/banner-model");

const sharp =
require("sharp");

const fs =
require("fs");


// ADD BANNER

const validateBannerImage =
async (file) => {

  if (!file) {

    return {
      success: false,
      message:
"Banner image is required",
    };
  }

  // FILE TYPE

  const allowedTypes = [

    "image/jpeg",

    "image/jpg",

    "image/png",

    "image/webp",
  ];

  if (

!allowedTypes.includes(
file.mimetype
)

  ) {

    fs.unlinkSync(
file.path
    );

    return {

      success: false,

      message:
"Only JPG, PNG and WEBP allowed",
    };
  }

  // FILE SIZE

  const maxSize =
2 * 1024 * 1024;

  if (
file.size > maxSize
  ) {

    fs.unlinkSync(
file.path
    );

    return {

      success: false,

      message:
"Image size must be under 2MB",
    };
  }

  // IMAGE DIMENSIONS

  const metadata =

await sharp(file.path)
.metadata();


// MIN WIDTH

if (
  metadata.width < 500
) {

  fs.unlinkSync(
    file.path
  );

  return {

    success: false,

    message:
      "Image width must be at least 500",
  };
}

// MAX WIDTH

if (
  metadata.width > 800
) {

  fs.unlinkSync(
    file.path
  );

  return {

    success: false,

    message:
      "Image width must not exceed 800px",
  };
}

// MIN HEIGHT

if (
  metadata.height < 500
) {

  fs.unlinkSync(
    file.path
  );

  return {

    success: false,

    message:
      "Image height must be at least 500px",
  };
}

// MAX HEIGHT

if (
  metadata.height > 800
) {

  fs.unlinkSync(
    file.path
  );

  return {

    success: false,

    message:
      "Image height must not exceed 800px",
  };
}



  return {
    success: true,
  };
};


exports.addBanner =
async (req, res) => {

  try {

    const {

      type,
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      priceText,
 category,
  subcategory,
    } = req.body;

// IMAGE VALIDATION

const validation =

await validateBannerImage(
req.file
);

if (
!validation.success
) {

  return res.status(400).json({

    success: false,

    message:
validation.message,
  });
}


    const banner =
      new Banner({

        type,
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        priceText,

        img:
          req.file.filename,
 category,
  subcategory,
      });

    await banner.save();

    res.status(201).json({

      success: true,
      message:
        "Banner added successfully",

      data: banner,

    });

  } catch (error) {

    res.status(500).json({

      success: false,
      message:
        error.message,

    });
  }
};

// GET ALL

exports.getBanners =
async (req, res) => {
 
  try {
   const page= Number(req.query.page)|| 1;
const limit= Number(req.query.limit) || 20;
const skip=(page-1)*limit;
    const banners =
      await Banner.find({
        isActive: true
      }).skip(skip).limit(limit).sort({ createdAt: -1 });
  const totalDocuments =await Banner.countDocuments();
       const totalPages = Math.ceil( totalDocuments / limit );
    res.json({
      success: true,
      data: banners,
      totalPages,
      totalDocuments,
      currentPage: page,
    });

  } catch (error) {

    res.status(500).json({

      success: false,
      message:
        error.message,

    });
  }
};

// DELETE

exports.deleteBanner =
async (req, res) => {

  try {

    await Banner.findByIdAndDelete(
      req.params.id
    );

    res.json({

      success: true,
      message:
        "Banner deleted",

    });

  } catch (error) {

    res.status(500).json({

      success: false,
      message: error.message,

    });
  }
};

exports.updateBanner =
async (req, res) => {

  try {

    const banner =
      await Banner.findById(
        req.params.id
      );

    if (!banner) {

      return res.status(404).json({

        success: false,

        message:
          "Banner not found",

      });
    }

    // TEXT FIELDS

    banner.type =
      req.body.type;

    banner.title =
      req.body.title;

    banner.subtitle =
      req.body.subtitle;

    banner.description =
      req.body.description;

    banner.buttonText =
      req.body.buttonText;

    banner.buttonLink =
      req.body.buttonLink;

    banner.priceText =
      req.body.priceText;

    banner.category =
      req.body.category;

    banner.subcategory =
      req.body.subcategory;

    // IMAGE UPDATE

    if (req.file) {

      const validation =
        await validateBannerImage(
          req.file
        );

      if (
        !validation.success
      ) {

        return res.status(400).json({

          success: false,

          message:
            validation.message,

        });
      }

      // DELETE OLD IMAGE

      if (banner.img) {

        const oldImagePath =
          `uploads/${banner.img}`;

        if (
          fs.existsSync(
            oldImagePath
          )
        ) {

          fs.unlinkSync(
            oldImagePath
          );
        }
      }

      // SAVE NEW IMAGE

      banner.img =
        req.file.filename;
    }

    await banner.save();

    res.status(200).json({

      success: true,

      message:
        "Banner updated successfully",

      data: banner,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        error.message,

    });
  }
};
