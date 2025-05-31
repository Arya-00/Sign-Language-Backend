const fs = require('fs');
const path = require("path");
const { GoogleGenAI, createUserContent, createPartFromUri, } = require("@google/genai");
const os = require('os');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function imageProcess(req, res) {
	const gemini = new GoogleGenAI({ apiKey: process.env.API_KEY });

	const prompt = `
		Identify any sign language symbol in the image.
		Return only this JSON format — no markdown, no explanation, no extra text:
		{
			"language": "string or null",
			"symbol": "string or null",
			"description": "string"
		}
		Example:
		{"language": "ASL", "symbol": "Hello", "description": "A person holding their hand up in the ASL 'hello' gesture."}
		If no symbol is found, return:
		{"language": null, "symbol": null, "description": "Description of the image here."}
	`;

	let tempFilePath = '';
	try {
		if (!req.file) {
			return res.status(400).json({ message: "Image is required" });
		}
		const buffer = Buffer.from(req.file.buffer.toString("base64"), "base64");
		tempFilePath = path.join(os.tmpdir(), "temp_image.jpg");
		fs.writeFileSync(tempFilePath, buffer);

		const uploadResult = await gemini.files.upload({
			file: tempFilePath,
			config: {
				mimeType: req.file.mimetype
			}
		});

		const result = await gemini.models.generateContent(
			{
				model: "gemini-2.0-flash",
				contents: createUserContent([
					createPartFromUri(uploadResult.uri, uploadResult.mimeType),
					prompt,
				]),
			}
		);
		const rawText = result.candidates?.[0].content.parts[0].text;
		const cleanedJson = rawText?.replace(/```json|```/g, '').trim();
		if (cleanedJson) {
			const parsedJSON = JSON.parse(cleanedJson);
			if (!parsedJSON.language) parsedJSON.language = "No Sign Language Identified";
			if (!parsedJSON.symbol) parsedJSON.symbol = "No Sign Language Symbol Identified";
			if (!parsedJSON.description) parsedJSON.description = "No Sign Language Description";
			return res.status(200).json({ response: parsedJSON});
		} else {
			throw new Error('❌ Failed to parse JSON:');
		}
	} catch (err) {
		return res.status(500).json({ "Request Failed Error": err.message });
	} finally {
		fs.unlinkSync(tempFilePath);
	}
}

module.exports = { imageProcess, upload };
