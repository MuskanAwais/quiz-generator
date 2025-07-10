// src/components/QuizGenerator.js
import React, { useState, useRef } from 'react';
import { Groq } from 'groq-sdk';

const QuizGenerator = ({ onQuizGenerated, setIsGenerating, setError }) => {
  const [numQuestions, setNumQuestions] = useState(5);
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);
    setIsProcessing(true);
    
    try {
      // Read file content
      const content = await readFileContent(file);
      
      // Generate quiz using Groq API
      const quiz = await generateQuiz(content, numQuestions, instructions);
      
      onQuizGenerated(quiz);
    } catch (err) {
      setError('Failed to generate quiz: ' + err.message);
      setIsGenerating(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = (e) => {
        reject(new Error('Failed to read file'));
      };
      
      if (file.type === 'application/pdf') {
        // Read PDF as array buffer
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'text/plain') {
        // Read text file directly
        reader.readAsText(file);
      } else {
        reject(new Error('Unsupported file type. Please upload a PDF or text file'));
      }
    });
  };

  const generateQuiz = async (content, numQuestions, instructions) => {
    const groq = new Groq({
      apiKey: 'hello',
      dangerouslyAllowBrowser: true
    });
    
    // Handle PDF content which comes as ArrayBuffer
    let textContent = content;
    if (content instanceof ArrayBuffer) {
      const decoder = new TextDecoder('utf-8');
      textContent = decoder.decode(new Uint8Array(content));
    }
    
    // Truncate content to prevent excessive API usage
    const truncatedContent = textContent.substring(0, 10000);
    
    const prompt = `
      You are an expert quiz generator. Create a multiple-choice quiz based on the following content:
      
      Content:
      ${truncatedContent} [truncated for efficiency]
      
      Instructions: ${instructions || 'No specific instructions provided'}
      
      Generate exactly ${numQuestions} multiple-choice questions. For each question:
      1. Provide a clear question
      2. Four possible answers (a, b, c, d)
      3. Indicate the correct answer
      
      Format your response as valid JSON:
      {
        "title": "Quiz Title",
        "questions": [
          {
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
          }
        ]
      }
      
      Important: Only return the JSON object, no additional text.
    `;

    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        response_format: { type: 'json_object' }
      });

      // Handle possible JSON parsing issues
      const quizContent = response.choices[0].message.content;
      const quiz = JSON.parse(quizContent);
      
      // Validate quiz structure
      if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error('Invalid quiz format received from API');
      }
      
      return quiz;
    } catch (err) {
      throw new Error('Failed to generate quiz: ' + err.message);
    }
  };

  return (
    <div className="quiz-generator">
      <h2>Create Your Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Upload Book (PDF or Text)</label>
          <div className="file-upload">
            <button 
              type="button" 
              className="upload-btn"
              onClick={() => fileInputRef.current.click()}
            >
              {file ? file.name : 'Choose File'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt"
              style={{ display: 'none' }}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Number of Questions</label>
          <input
            type="number"
            min="1"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
          />
        </div>
        
        <div className="form-group">
          <label>Special Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. 'Focus on chapter 3', 'Make questions difficult', etc."
          />
        </div>
        
        <button 
          type="submit" 
          className="generate-btn"
          disabled={!file || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Generate Quiz'}
        </button>
      </form>
    </div>
  );
};

export default QuizGenerator;