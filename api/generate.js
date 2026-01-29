export default async function handler(req, res) {
    // --- CORS ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    // --- Params ---
    const {
        topic = "",      // Asosiy mavzu (masalan: "Plovda 20% chegirma", "Yangi kaboblar")
        restaurant = "", // Restoran nomi (ixtiyoriy)
        tone = "friendly", // friendly, catchy, urgent
        language = "uz"
    } = req.body || {};

    if (!topic) {
        return res.status(400).json({ error: "Mavzu (topic) yozilishi shart" });
    }

    // Promptni food-delivery loyihasiga moslashtiramiz
    const prompt = `
Siz ovqat yetkazish xizmati uchun professional marketolog va push notification bo'yicha mutaxaxissiz.

Topshiriq: "${topic}" mavzusida jozibali push notification yozing.
${restaurant ? `Restoran nomi: ${restaurant}` : ""}
Til: ${language}
Uslub (Ton): ${tone}

Qoidalar:
1. Sarlavha (Title): Juda qisqa, e'tiborni tortadigan va ishtahani ochadigan bo'lsin (maksimum 40 belgi).
2. Matn (Body): Foydalanuvchini hoziroq buyurtma berishga undaydigan (CTA), samimiy va lo'nda bo'lsin (maksimum 120 belgi).
3. Emojilar: Mavzuga mos 1-2 ta mazali emojilar ishlating (masalan: 🍕, 🥗, 🚀, 🔥).
4. Restoran nomi: Agar berilgan bo'lsa, uni matnga tabiiy ravishda kiriting.

3 ta variant qaytaring:
- Variant 1: Qiziqtiruvchi/Ishtaha ochuvchi
- Variant 2: To'g'ridan-to'g'ri/Ma'lumot beruvchi
- Variant 3: Shoshiltiruvchi (Limited offer/Urgent)

Faqat JSON formatida qaytaring:
{"variants": ["...", "...", "..."]}
`.trim();

    try {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "Siz faqat JSON qaytaradigan foydali yordamchisiz."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.8 // Ijodiylik uchun biroz balandroq
            })
        });

        if (!r.ok) {
            const text = await r.text();
            return res.status(500).json({ error: "Groq API error", details: text });
        }

        const data = await r.json();
        const outputText = data.choices?.[0]?.message?.content ?? "";

        let parsed;
        try {
            parsed = JSON.parse(outputText);
        } catch {
            parsed = { variants: ["Xatolik yuz berdi, qaytadan urinib ko'ring"] };
        }

        return res.status(200).json(parsed);
    } catch (e) {
        return res.status(500).json({ error: "Server error", details: String(e) });
    }
}
