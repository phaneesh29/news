import AppError from "../utils/appError.js";

const validate = (schema, source = "body") => (req, res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    const issues = parsed.error.issues || parsed.error.errors || [];
    const messages = issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return next(new AppError(`Validation error: ${messages}`, 400));
  }
  
  Object.assign(req[source], parsed.data);
  next();
};

export default validate;
