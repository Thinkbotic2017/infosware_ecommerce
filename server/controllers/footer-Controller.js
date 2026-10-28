const Footer = require("../models/footer-model");

// CREATE FOOTER

exports.createFooter =
async (req, res) => {

  try {


    const {

      companyDescription,

      address,

      phone,

      email,

      copyright,

      quickLinks,

      socials,

    } = req.body;

    // DELETE OLD FOOTER
    // SO ONLY ONE FOOTER EXISTS

    await Footer.deleteMany();

    const footer =
      new Footer({

        companyDescription,

        address,

        phone,

        email,

        copyright,

        quickLinks:
          JSON.parse(
            quickLinks
          ),

        socials:
          JSON.parse(
            socials
          ),

      });

    await footer.save();

    res.status(201).json({

      success: true,

      message:
        "Footer created successfully",

      data: footer,

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

// GET FOOTER

exports.getFooter =
async (req, res) => {

  try {

    const footer =
      await Footer.findOne();

    res.status(200).json({

      success: true,

      data: footer,

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

// UPDATE FOOTER

exports.updateFooter =
async (req, res) => {

  try {

    const {

      companyDescription,

      address,

      phone,

      email,

      copyright,

      quickLinks,

      socials,

    } = req.body;

    const footer =
      await Footer.findById(
        req.params.id
      );

    if (!footer) {

      return res.status(404).json({

        success: false,

        message:
          "Footer not found",

      });
    }

    footer.companyDescription =
      companyDescription;

    footer.address =
      address;

    footer.phone =
      phone;

    footer.email =
      email;

    footer.copyright =
      copyright;

    footer.quickLinks =
      JSON.parse(
        quickLinks
      );

    footer.socials =
      JSON.parse(
        socials
      );

    await footer.save();

    res.status(200).json({

      success: true,

      message:
        "Footer updated successfully",

      data: footer,

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

// DELETE FOOTER

exports.deleteFooter =
async (req, res) => {

  try {

    await Footer.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({

      success: true,

      message:
        "Footer deleted successfully",

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