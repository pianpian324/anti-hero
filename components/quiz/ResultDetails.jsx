export default function ResultDetails({ answers, totalTime }) {
  const correctAnswers = answers.filter(a => a.question.correctAnswer === a.selected).length;
  const accuracy = (correctAnswers / answers.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Results</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Questions</div>
          <div className="text-2xl font-bold text-blue-600">{answers.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Correct Answers</div>
          <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Accuracy</div>
          <div className="text-2xl font-bold text-yellow-600">{accuracy.toFixed(1)}%</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Time</div>
          <div className="text-2xl font-bold text-purple-600">{totalTime}s</div>
        </div>
      </div>

      {/* Answer Review */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Answer Review</h4>
        {answers.map((answer, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${
              answer.selected === answer.question.correctAnswer
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="font-medium text-gray-900 mb-2">
              {answer.question.question}
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="text-sm">
                <span className="text-gray-600">Your answer: </span>
                <span className={answer.selected === answer.question.correctAnswer ? 'text-green-600' : 'text-red-600'}>
                  {answer.question.options[answer.selected]}
                </span>
              </div>
              {answer.selected !== answer.question.correctAnswer && (
                <div className="text-sm">
                  <span className="text-gray-600">Correct answer: </span>
                  <span className="text-green-600">
                    {answer.question.options[answer.question.correctAnswer]}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
