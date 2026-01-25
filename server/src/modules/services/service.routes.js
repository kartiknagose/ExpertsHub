const { Router } = require('express');
const { list, getOne } = require('./service.controller');

const router = Router();

// Public endpoints
router.get('/', list);
router.get('/:id', getOne);

module.exports = router;