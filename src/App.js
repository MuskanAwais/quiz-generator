// src/App.js
import React, { useState, useRef } from 'react';
import QuizGenerator from './components/QuizGenerator';
import QuizDisplay from './components/QuizDisplay';
import PDFGenerator from './components/PDFGenerator';
import './App.css';

function App() {
  const [quizData, setQuizData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const pdfRef = useRef();

  const handleQuizGenerated = (quiz) => {
    setQuizData(quiz);
    setIsGenerating(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Quiz Generator</h1>
        <p>Upload books, generate quizzes, and download PDFs</p>
      </header>
      
      <main className="main-content">
        <QuizGenerator 
          onQuizGenerated={handleQuizGenerated} 
          setIsGenerating={setIsGenerating}
          setError={setError}
        />
        
        {isGenerating && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Generating your quiz... This may take a moment</p>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        {quizData && (
          <div className="quiz-results">
            {/* Content to be converted to PDF */}
            <div ref={pdfRef}>
              <QuizDisplay quizData={quizData} />
            </div>
            
            {/* PDF Generator component */}
            <PDFGenerator contentRef={pdfRef} quizTitle={quizData.title} />
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Powered by Groq API • AI Quiz Generator</p>
      </footer>
    </div>
  );
}

export default App;