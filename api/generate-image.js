export default async function handler(req, res) {
    // --- CORS sozlamalari ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // OPTIONS so'rovini (preflight) darhol qaytarish
    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { prompt } = req.body;

    try {
        const response = await fetch("https://api.siliconflow.cn/v1/images/generations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.SILICON_FLOW_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "black-forest-labs/FLUX.1-schnell",
                prompt: prompt,
                image_size: "1024x1024",
                batch_size: 1,
                num_inference_steps: 4
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data });
        }

        // SiliconFlow tayyor rasm URL-ni qaytaradi
        res.status(200).json({ imageUrl: data.images[0].url });
    } catch (error) {
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
}