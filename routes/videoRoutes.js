const express = require("express");
const cors = require("cors");
const router = express.Router();
const { upload, videoProcess } = require("../controllers/videoControl");

router.use(cors({
	origin: ['https://sign-language-app.netlify.app'],
	credentials: true
}));
router.post('/', upload.single('file'), videoProcess);

module.exports = router;