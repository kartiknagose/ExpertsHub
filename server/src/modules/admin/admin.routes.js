const { Router } = require('express');
const auth = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/requireRole');
const validate = require('../../middleware/validation');
const { getUsersSchema, updateUserStatusSchema } = require('./admin.schemas');
const { getDashboard, getUsers, getWorkers, updateUser, removeUser } = require('./admin.controller');

const router = Router();

router.get('/dashboard', auth, requireAdmin, getDashboard);
router.get('/users', auth, requireAdmin, getUsersSchema, validate, getUsers);
router.get('/workers', auth, requireAdmin, getWorkers);
router.patch('/users/:id/status', auth, requireAdmin, updateUserStatusSchema, validate, updateUser);
router.delete('/users/:id', auth, requireAdmin, removeUser);

module.exports = router;
