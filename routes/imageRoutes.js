const express = require("express");
const cors = require("cors");
const router = express.Router();
const { upload, imageProcess } = require("../controllers/imageControl");

router.use(cors({
	origin: ['http://localhost:4200'],
	credentials: true
}));
router.post('/', upload.single('image'), imageProcess);

module.exports = router;