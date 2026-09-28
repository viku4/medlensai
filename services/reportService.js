const { OpenAI } = require('openai');

class ReportService {
  static async analyzeMedicalReport(fileBuffer, mimeType) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set in .env.');
    }

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:8000',
        'X-Title': 'Medical Analyzer Backend',
      },
    });

    // Vision-capable models on OpenRouter ordered by speed and availability
    const modelsToTry = [
      'google/gemini-2.5-flash',
      'anthropic/claude-3.5-haiku',
      'meta-llama/llama-3.2-11b-vision-instruct'
    ];

    const prompt = `
      You are an expert medical document parser and health educator AI.
      Analyze this medical report image and extract test metrics.

      Return output STRICTLY in this JSON structure:
      {
        "report_type": "Name/type of medical report (e.g. Complete Blood Count)",
        "summary": "Brief non-technical overall summary",
        "metrics": [
          {
            "name": "Biomarker Name",
            "value": "Measured Value",
            "unit": "Unit",
            "reference_range": "Normal Reference Range",
            "status": "Normal | Low | High | Critical",
            "medical_explanation": "Simple definition of what this biomarker is and does in the body",
            "what_it_means": "Plain-English explanation of what this specific result implies for health"
          }
        ],
        "health_recommendations": [
          "Actionable lifestyle/dietary advice point 1",
          "Actionable lifestyle/dietary advice point 2"
        ]
      }
    `;

    const base64Data = fileBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Attempting Analysis] Requesting model via OpenRouter: ${modelName}...`);

        const completion = await openai.chat.completions.create({
          model: modelName,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl
                  }
                }
              ]
            }
          ]
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
          throw new Error(`Empty response received from model ${modelName}`);
        }

        console.log(`[Success] Analysis completed using ${modelName}`);
        return JSON.parse(responseText);
      } catch (err) {
        console.warn(`[Warning] OpenRouter model ${modelName} failed: ${err.message}`);
        lastError = err;
      }
    }

    throw lastError || new Error('All OpenRouter model attempts failed.');
  }
}

module.exports = ReportService;