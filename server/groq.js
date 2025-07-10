const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GROQ_API_KEY;

async function generateQuiz(inputText) {
  const prompt = `
Generate exactly 10 multiple-choice questions from the text below.
Return ONLY valid JSON: an array of objects, each object = {
  "question": "...",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "answer": "A|B|C|D"
}

Text:
"""${inputText}"""
`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192", // ✅ Correct model name (update based on available models)
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseText = response.data.choices[0].message.content;

    // Remove any leading strings like: "Here are the 10 multiple-choice questions generated from the text:" if present
    const cleanedResponseText = responseText.replace(
      "Here are the 10 multiple-choice questions generated from the text:",
      ""
    ).trim();

    // Attempt to parse the cleaned response
    try {
      const quizData = JSON.parse(cleanedResponseText);
      return quizData;
    } catch (err) {
      console.error("Failed to parse JSON:", cleanedResponseText);
      throw new Error("Model did not return valid JSON");
    }
  } catch (err) {
    console.error("Error generating quiz:", err);
    throw new Error("API request failed");
  }
}

module.exports = { generateQuiz };
