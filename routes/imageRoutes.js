const express = require("express");
const cors = require("cors");
const router = express.Router();
const { upload, imageProcess } = require("../controllers/imageControl");

router.use(cors({
	origin: ['https://sign-language-app.netlify.app'],
	credentials: true
}));
router.post('/', upload.single('image'), imageProcess);

module.exports = router;