const ctrlWrapper = (func) => {
  const wrapperFunc = async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  return wrapperFunc;
}

module.exports = { ctrlWrapper };