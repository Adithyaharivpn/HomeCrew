const { check, validationResult } = require('express-validator');

const SignupvalidateRules = () => {
  return [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'Password must be 6+ characters').isLength({ min: 6 }),
    check('role', 'Role is required').notEmpty().isIn(['customer', 'tradesperson']),
    
    check('tradeCategory')
      .if((value, { req }) => req.body.role === "tradesperson")
      .notEmpty().withMessage('Trade category is required'),

    check('experience')
      .if((value, { req }) => req.body.role === "tradesperson")
      .notEmpty().withMessage('Experience is required')
      .isNumeric().withMessage('Experience must be a number'),

    check('location')
      .if((value, { req }) => req.body.role === "tradesperson")
      .notEmpty().withMessage('Location is required'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  SignupvalidateRules,
  validate,
};
