const multer = require("multer");
const fs = require("fs/promises");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const upload = multer({ dest: "uploads/" });

async function videoProcess(req, res) {
	const prompt = `Analyze the video and return structured information in below JSON format only.
		{
		"language": {
			"name": "Detected sign language (e.g., ASL, BSL, etc.)",
			"confidence": "High / Medium / Low"
		},
		"signs": [
			{
			"gloss": "Canonical representation of the sign (e.g., THANK-YOU)",
			"translation": "Natural language meaning (e.g., Thank you)"
			}
		],
		"description": "Full narrative description of the video content, including scene, topic, and any culturally or linguistically relevant cues."
		}`;

	let filePath;

	try {
		if (!req.file) {
			return res.status(400).json({ message: "Video is required" });
		}

		if (!process.env.API_KEY) {
			return res.status(500).json({ message: "Missing API_KEY" });
		}

		filePath = path.join(req.file.destination, req.file.filename);
		const videoBuffer = await fs.readFile(filePath);
		const base64VideoFile = videoBuffer.toString("base64");

		const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

		const contents = [
			{
				inlineData: {
					mimeType: "video/mp4",
					data: base64VideoFile,
				},
			},
			{ text: prompt },
		];

		const response = await ai.models.generateContent({
			model: "gemini-2.0-flash",
			contents,
		});

		let rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
		let parsed;

		try {
			rawText = rawText.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
			parsed = JSON.parse(rawText);
		} catch (parseErr) {
			console.warn("Failed to parse AI response as JSON");
			parsed = rawText;
		}

		return res.status(200).json({ response: parsed });

	} catch (err) {
		console.error("Processing error:", err);
		return res.status(500).json({ error: err.message || "Internal server error" });

	} finally {
		await fs.unlink(filePath);
	}
}

module.exports = { videoProcess, upload };
