const { Router } = require('express');
const ctrl = require('../controllers/inventoryController');
const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
