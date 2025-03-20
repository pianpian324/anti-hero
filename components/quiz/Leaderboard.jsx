export default function Leaderboard({ scores }) {
  return (
    <div className="quiz-card">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Leaderboard</h2>
      
      <div className="space-y-4">
        {scores.map((score, index) => (
          <div
            key={score.did}
            className={`flex items-center p-4 ${
              index < 3 ? 'bg-primary/10 dark:bg-primary/20' : 'bg-gray-50 dark:bg-gray-700/50'
            } rounded-lg transition-all hover:transform hover:scale-[1.02] dark:border dark:border-gray-700`}
          >
            {/* Rank */}
            <div className="w-12 h-12 flex items-center justify-center">
              {index < 3 ? (
                <span className="text-2xl filter drop-shadow-sm">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
              ) : (
                <span className="font-mono text-lg font-semibold text-secondary dark:text-gray-400">
                  #{index + 1}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 ml-4">
              <div className="font-semibold text-gray-900 dark:text-white truncate">
                {score.name || score.did.substring(0, 16) + '...'}
              </div>
              <div className="text-sm text-secondary dark:text-gray-400 flex items-center space-x-4">
                <span>✓ {score.correctAnswers} correct</span>
                <span className="font-mono">{score.totalTime}s</span>
              </div>
            </div>

            {/* Score */}
            <div className="ml-4">
              <div className="text-lg font-bold text-primary dark:text-primary/90 font-mono">
                {score.points} pts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
