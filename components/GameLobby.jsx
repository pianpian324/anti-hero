import { useRouter } from 'next/navigation';
import ConnectWallet from '@/components/ConnectWallet';

export default function GameLobby({ isConnected, onConnect }) {
  const router = useRouter();

  const handleJoinGame = () => {
    router.push('/quiz');
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Web5 Quiz Challenge
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Test your knowledge and compete with others in this decentralized quiz game!
        </p>
      </div>

      {!isConnected ? (
        <div className="space-y-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to start playing
          </p>
          <ConnectWallet/>
        </div>
      ) : (
        <div className="space-y-6 w-full text-center">
          <div className="quiz-card">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to Play?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join a game room and start answering questions!
            </p>
            <button
              onClick={handleJoinGame}
              className="quiz-button-primary w-full"
            >
              Join Game Room
            </button>
          </div>
        </div>
      )}

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 w-full mt-8">
        <div className="quiz-card text-center">
          <div className="text-2xl font-bold text-primary">1,234</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Players</div>
        </div>
        <div className="quiz-card text-center">
          <div className="text-2xl font-bold text-success">98%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
        </div>
        <div className="quiz-card text-center">
          <div className="text-2xl font-bold text-accent">500+</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
        </div>
      </div>
    </div>
  );
}
