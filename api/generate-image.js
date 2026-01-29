// Helper function to parse request body
async function parseBody(req) {
    if (req.body) return req.body; // Vercel already parses it

    // For Node.js HTTP server
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch {
                resolve({});
            }
        });
    });
}

export default async function handler(req, res) {

    // --- CORS ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    // --- Himoya (ixtiyoriy) ---
    const auth = req.headers.authorization || "";
    const expected = process.env.DEMO_SECRET ? `Bearer ${process.env.DEMO_SECRET}` : "";
    if (expected && auth !== expected) return res.status(401).json({ error: "Unauthorized" });

    const {
        prompt = "",
        aspectRatio = "1:1",
        outputFormat = "webp",
        outputQuality = 80,
        numOutputs = 1
    } = await parseBody(req) || {};


    if (!prompt) {
        return res.status(400).json({ error: "Prompt majburiy" });
    }

    try {
        // Replicate API bilan rasm generatsiya qilish
        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.REPLICATE_API_KEY}`,
                "Prefer": "wait" // Natijani kutish
            },
            body: JSON.stringify({
                version: "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc", // Flux Schnell (tez va bepul)
                input: {
                    prompt: prompt,
                    aspect_ratio: aspectRatio,
                    output_format: outputFormat,
                    output_quality: outputQuality,
                    num_outputs: numOutputs
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                error: "Replicate API error",
                details: errorText
            });
        }

        const prediction = await response.json();

        // Agar rasm tayyor bo'lsa
        if (prediction.status === "succeeded") {
            return res.status(200).json({
                success: true,
                images: prediction.output, // Array of image URLs
                id: prediction.id,
                model: "flux-schnell"
            });
        }

        // Agar kutish kerak bo'lsa (Prefer: wait bo'lmasa)
        if (prediction.status === "starting" || prediction.status === "processing") {
            return res.status(202).json({
                success: false,
                message: "Rasm generatsiya qilinmoqda...",
                id: prediction.id,
                status: prediction.status,
                checkUrl: `https://api.replicate.com/v1/predictions/${prediction.id}`
            });
        }

        // Xatolik bo'lsa
        return res.status(500).json({
            error: "Generatsiya muvaffaqiyatsiz",
            status: prediction.status,
            details: prediction.error
        });

    } catch (e) {
        return res.status(500).json({
            error: "Server error",
            details: String(e)
        });
    }
}
