export const parseJsonFields = (req, res, next) => {
  const jsonFields = ['location', 'gallery', 'category'];

  jsonFields.forEach(field => {
    if (req.body[field]) {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (error) {
        return res.status(400).json({ message: `Invalid JSON format for field ${field}` });
      }
    }
  });

  next();
};
