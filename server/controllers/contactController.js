const Contact = require("../models/contact-model.js");
// get queries
exports.getAllQueries =
async (req, res) => {

  try {

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const skip =
      (page - 1) * limit;

    const queries =
      await Contact.find()

        .sort({
          createdAt: -1,
        })

        .skip(skip)

        .limit(limit);

    const totalDocuments =
      await Contact.countDocuments();

    const totalPages =
      Math.ceil(
        totalDocuments / limit
      );

    res.status(200).json({

      success: true,

      count:
        queries.length,

      data:
        queries,

      totalPages,

      totalDocuments,

      currentPage:
        page,

    });

  } catch (err) {

    console.log(
      "error to fetch all queries",
      err
    );

    res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};
// create contact
exports.createContact = async (req, res) => {
    try {

        const name =
            req.body.name?.trim();

        const email =
            req.body.email?.trim();

        const phone =
            req.body.phone?.trim();

        const description =
            req.body.description?.trim();

        if (!name || !email || !phone || !description) {
            res.status(400).json({
                success: false,
                msg: "ALL feilds are required",
            })
        }
        const contact = await Contact.create(
            {
                name, email, phone, description
            }
        )
        res.status(201).json({
            success: true,
            message: "query submittted successfully ",
            data: contact,

        })
    }
    catch (err) {
        console.log("create contact error", err);
        res.status(500).json({
            success: false,
            message: "Server Error",

        })
    }
}

// get one query

exports.getOneQuery = async (req, res) => {
    try {

        const { id } = req.params;
        const query = Contact.findById(id)

        if (!query) {
            return res.status(404).json({
                success: false,
                msg: "query not found",
            })
        }


        res.status(200).json({
            success: true,
            data: query,
        })

    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Server Error"
        })
    }
}

// update status

exports.updateQueryStatus =
    async (req, res) => {

        const { id } =
            req.params;

        const { status } =
            req.body;

        const query =
            await Contact.findByIdAndUpdate(

                id,

                { status },

                { new: true }
            );

        res.status(200).json({

            success: true,

            data: query
        });
    }

