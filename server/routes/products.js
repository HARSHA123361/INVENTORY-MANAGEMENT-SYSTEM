const { Router } = require('express');
const ctrl = require('../controllers/productController');
const router = Router();

router.get('/active', ctrl.getActive);  // must be before /:id
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
