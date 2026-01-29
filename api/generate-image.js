export default async function handler(req, res) {
    // --- CORS sozlamalari ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    // DIQQAT: API key .env faylda SILICON_FLOW_KEY nomi bilan bo'lishi shart!
    const apiKey = process.env.SILICON_FLOW_KEY;

    if (!apiKey) {
        console.error("SILICON_FLOW_KEY is missing in environment variables!");
        return res.status(500).json({ error: "API Configuration error on server" });
    }

    try {
        // Curl so'rovidagidek .com URL ishlatamiz
        const response = await fetch("https://api.siliconflow.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "black-forest-labs/FLUX.1-dev", // Curl'dagi model
                prompt: prompt,
                image_size: "1024x1024",
                num_inference_steps: 20, // Curl'dagi qiymat
                prompt_enhancement: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("SiliconFlow Error:", data);
            return res.status(response.status).json({
                error: "SiliconFlow returned an error",
                details: data
            });
        }

        // Muvaffaqiyatli javob
        if (data.images && data.images.length > 0) {
            return res.status(200).json({ imageUrl: data.images[0].url });
        } else {
            return res.status(500).json({ error: "No image generated in the response" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}