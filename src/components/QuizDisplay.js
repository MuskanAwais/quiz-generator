// src/components/QuizDisplay.js
import React from 'react';

const QuizDisplay = ({ quizData }) => {
  if (!quizData || !quizData.questions) {
    return (
      <div className="quiz-display">
        <h2>No Quiz Data Available</h2>
        <p>Please generate a quiz first</p>
      </div>
    );
  }

  return (
    <div className="quiz-display">
      <h2>{quizData.title || 'Generated Quiz'}</h2>
      <div className="quiz-questions">
        {quizData.questions.map((q, index) => (
          <div key={index} className="question-card">
            <h3>{index + 1}. {q.question}</h3>
            <div className="options">
              {q.options && q.options.map((option, optIndex) => (
                <div 
                  key={optIndex} 
                  className={`option ${optIndex === q.correctAnswer ? 'correct' : ''}`}
                >
                  {String.fromCharCode(65 + optIndex)}. {option}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizDisplay;