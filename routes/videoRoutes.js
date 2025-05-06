const express = require("express");
const cors = require("cors");
const router = express.Router();
const { upload, videoProcess } = require("../controllers/videoControl"); // Adjust path if needed

router.use(cors({
	origin: ['http://localhost:4200'],
	credentials: true
}));
router.post('/', upload.single('file'), videoProcess);

module.exports = router;