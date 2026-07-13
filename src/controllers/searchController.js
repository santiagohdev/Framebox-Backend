import searchService from "../services/searchService.js";

const suggestions = async (req, res, next) => {
  try {
    const results = await searchService.search(req.query.query);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export default { suggestions };
