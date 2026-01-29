export default async function handler(req, res) {
    // --- CORS ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    // --- Minimal himoya (ixtiyoriy) ---
    const auth = req.headers.authorization || "";
    const expected = process.env.DEMO_SECRET ? `Bearer ${process.env.DEMO_SECRET}` : "";
    if (expected && auth !== expected) return res.status(401).json({ error: "Unauthorized" });

    const {
        language = "uz",
        tone = "friendly",
        goal = "",
        product = "",
        audience = "",
        constraints = "120-160 belgi, 1-2 emoji"
    } = req.body || {};

    const prompt = `
Siz push notification copywriterisiz.
Til: ${language}
Ton: ${tone}
Maqsad: ${goal}
Mahsulot/feature: ${product}
Auditoriya: ${audience}
Cheklov: ${constraints}

3 ta variant yozing. Faqat JSON qaytaring:
{"variants":["...","...","..."]}
`.trim();

    try {
        const r = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: prompt,
                text: { format: { type: "json_object" } }
            })
        });

        if (!r.ok) {
            const text = await r.text();
            return res.status(500).json({ error: "OpenAI error", details: text });
        }

        const data = await r.json();
        const outputText =
            data.output_text ||
            (data.output?.[0]?.content?.[0]?.text ?? "");

        let parsed;
        try { parsed = JSON.parse(outputText); }
        catch { parsed = { variants: [outputText] }; }

        return res.status(200).json(parsed);
    } catch (e) {
        return res.status(500).json({ error: "Server error", details: String(e) });
    }
}
