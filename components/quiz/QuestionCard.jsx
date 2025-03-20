import { useState } from 'react';

export default function QuestionCard({ question, onAnswer, timeLeft }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer);
    }
  };

  return (
    <div className="quiz-card">
      {/* Timer */}
      <div className="mb-4 text-right">
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Time Left: {timeLeft}s
        </span>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedAnswer(index)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
              selectedAnswer === index
                ? 'bg-primary text-white transform scale-[1.02]'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100'
            }`}
          >
            <span className="font-mono mr-2 opacity-75">{String.fromCharCode(65 + index)}.</span>
            {option}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className={selectedAnswer === null ? 'quiz-button-secondary opacity-50 cursor-not-allowed' : 'quiz-button-primary'}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}
