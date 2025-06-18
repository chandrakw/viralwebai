const fetch = require('node-fetch');

exports.handler = async function(event) {
    // Hanya izinkan metode POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Kunci API OpenAI belum diatur di server." })
        };
    }

    let prompt;
    try {
        const body = JSON.parse(event.body);
        prompt = body.prompt;
        if (!prompt) {
            throw new Error("Prompt tidak ditemukan dalam request.");
        }
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Tangani error dari OpenAI
            throw new Error(data.error ? data.error.message : `API Error: Status ${response.status}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ completion: data.choices[0].message.content })
        };

    } catch (error) {
        console.error("Error in serverless function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
