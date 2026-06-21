import AppError from "../utils/appError.js";
import { parseMarkdown } from "../utils/markdownParser.js";

export const getDigest = async (req, res, next) => {
  try {
    const url = "https://raw.githubusercontent.com/phaneesh29/news/master/content/news.md";
    const response = await fetch(url);
    if (!response.ok) {
      return next(new AppError(`Failed to fetch digest content: ${response.statusText}`, response.status));
    }
    const md = await response.text();
    const digestData = parseMarkdown(md);
    
    res.status(200).json({
      status: "success",
      data: digestData
    });
  } catch (error) {
    next(error);
  }
};
