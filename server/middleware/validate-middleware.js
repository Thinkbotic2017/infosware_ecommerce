
const validate = (schema) => async (req, res, next) => {
  try {
    const parsedBody = await schema.parseAsync(req.body);
    req.body = parsedBody;
    next();
  } catch (err) {
    if (err.name === "ZodError") {
      const errors = err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      console.log("Validation failed:", errors);

      return res.status(422).json({
        message: "Fill the input properly",
        errors,
      });
    }

    next(err);
  }
};

module.exports = validate;
