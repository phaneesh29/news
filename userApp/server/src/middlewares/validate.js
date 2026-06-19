import AppError from "../utils/appError.js";

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error.issues || parsed.error.errors || [];
      const messages = issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return next(new AppError(`Validation error: ${messages}`, 400));
    }
    req.body = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
};

export default validate;
