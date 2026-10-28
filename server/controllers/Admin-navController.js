const Navbar = require('../models/navbar-model');
const path = require('path');
const fs = require('fs');
const sharp = require("sharp");


const validateLogoImage =
async (file) => {

  if (!file) {

    return {
      success: false,
      message:
        "Logo image is required",
    };

  }

  // FILE TYPES

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
    1 * 1024 * 1024;

  if (
    file.size > maxSize
  ) {

    fs.unlinkSync(
      file.path
    );

    return {

      success: false,

      message:
        "Image size must be under 1MB",

    };

  }

  // IMAGE DIMENSIONS

  const metadata =

    await sharp(
      file.path
    ).metadata();

  // MIN WIDTH

  if (
    metadata.width < 150
  ) {

    fs.unlinkSync(
      file.path
    );

    return {

      success: false,

      message:
        "Logo width must be at least 150px",

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
        "Logo width must not exceed 800px",

    };

  }

  // MIN HEIGHT

  if (
    metadata.height < 40
  ) {

    fs.unlinkSync(
      file.path
    );

    return {

      success: false,

      message:
        "Logo height must be at least 40px",

    };

  }

  // MAX HEIGHT

  if (
    metadata.height > 200
  ) {

    fs.unlinkSync(
      file.path
    );

    return {

      success: false,

      message:
        "Logo height must not exceed 200px",

    };

  }

  return {
    success: true,
  };

};

const getAllNavbars = async (req, res, next) => {
    try {
        // Initialize Navbars before using it
        let Navbars = await Navbar.find({});
        if (!Navbars || Navbars.length === 0) {
            return res.status(404).json({ msg: "No navbar items found" });
        }
        return res.status(200).json({ Navbars });
    } catch (error) {
        next(error);
    }
};





const addLogo = async (req, res) => {
console.log("BODY:", req.body);
console.log("FILE:", req.file);
  try {

    const { label, path } = req.body;

    const validation =
      await validateLogoImage(
        req.file
      );

    if (!validation.success) {

      return res.status(400).json({
        message:
          validation.message,
      });

    }
console.log(validation);
    const logo =
      req.file.filename;
if (!path?.trim()) {

  return res.status(400).json({

    message:
      "Path is required",

  });

}

if (
  !path.startsWith("/")
) {

  return res.status(400).json({

    message:
      "Path must start with /",

  });

}
    const newLogo =
      new Navbar({

        label,
        path,
        logo,

      });

    const savedLogo =
      await newLogo.save();

    return res.status(201).json(
      savedLogo
    );

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      message:
        "Something went wrong",

    });

  }

};

const updateLogoById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;

      if (req.file) {

  const validation =

    await validateLogoImage(
      req.file
    );

  if (
    !validation.success
  ) {

    return res.status(400).json({

      message:
        validation.message,

    });

  }

  updatedData.logo =
    req.file.filename;

}

        const updateLogo = await Navbar.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
        return res.status(200).json({ msg: "Logo updated successfully", updateLogo });
    } catch (error) {
        next(error);
    }
};

const deleteLogoById = async (req, res, next) => {
    try {
        const id = req.params.id;
        await Navbar.deleteOne({ _id: id });
        return res.status(200).json({ msg: "Logo deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllNavbars, addLogo, deleteLogoById, updateLogoById };