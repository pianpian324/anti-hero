'use client';

import { useState, useEffect } from 'react';
import QuestionCard from '@/components/quiz/QuestionCard';
import Timer from '@/components/quiz/Timer';
import Leaderboard from '@/components/quiz/Leaderboard';
import QuizTypeSelector from '@/components/quiz/QuizTypeSelector';
import ResultDetails from '@/components/quiz/ResultDetails';
import { ConnectWallet } from '@/components/ConnectWallet';

export default function QuizPage() {
  const [gameState, setGameState] = useState('idle'); // idle, selecting, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [quizType, setQuizType] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Mock questions - will be replaced with Web5 DWN data
  const mockQuestions = {
    web5: [
      {
        question: "What is Web5?",
        options: [
          "A decentralized web platform",
          "A new programming language",
          "A blockchain network",
          "A web browser"
        ],
        correctAnswer: 0
      },
      {
        question: "What is DWN in Web5?",
        options: [
          "Digital Wallet Network",
          "Decentralized Web Node",
          "Dynamic Web Navigator",
          "Data Web Network"
        ],
        correctAnswer: 1
      }
    ],
    blockchain: [
      {
        question: "What is a blockchain?",
        options: [
          "A type of cryptocurrency",
          "A distributed database",
          "A programming language",
          "A web browser"
        ],
        correctAnswer: 1
      }
    ],
    programming: [
      {
        question: "What is React?",
        options: [
          "A JavaScript library for building user interfaces",
          "A programming language",
          "A database system",
          "A web server"
        ],
        correctAnswer: 0
      }
    ]
  };

  const handleQuizTypeSelect = (type) => {
    setQuizType(type);
    setGameState('playing');
    setCurrentQuestion(mockQuestions[type][0]);
    setTotalTime(0);
  };

  const handleAnswer = (selectedAnswer) => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setScore((prev) => prev + (isCorrect ? 10 : 0));
    setAnswers((prev) => [...prev, { question: currentQuestion, selected: selectedAnswer }]);
    
    // Check if there are more questions
    const currentIndex = mockQuestions[quizType].findIndex(q => q.question === currentQuestion.question);
    if (currentIndex < mockQuestions[quizType].length - 1) {
      setCurrentQuestion(mockQuestions[quizType][currentIndex + 1]);
    } else {
      setGameState('finished');
    }
  };

  const handleTimeUp = () => {
    if (gameState === 'playing') {
      setGameState('finished');
    }
  };

  const handleRestart = () => {
    setGameState('idle');
    setQuizType(null);
    setScore(0);
    setAnswers([]);
    setTotalTime(0);
  };

  // Update total time during gameplay
  useEffect(() => {
    let timer;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Web5 Quiz Challenge
          </h1>
          <div className="flex justify-center">
            <ConnectWallet/>
          </div>
        </div>

        {/* Game Content */}
        <div className="mt-8">
          {gameState === 'idle' && (
            <>
              {isConnected ? (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                    Select Quiz Type
                  </h2>
                  <QuizTypeSelector onSelect={handleQuizTypeSelect} />
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  Please connect your wallet to start the quiz
                </div>
              )}
            </>
          )}

          {gameState === 'playing' && currentQuestion && (
            <div className="space-y-6">
              <Timer duration={30} onTimeUp={handleTimeUp} />
              <QuestionCard
                question={currentQuestion}
                onAnswer={handleAnswer}
              />
            </div>
          )}

          {gameState === 'finished' && (
            <div className="space-y-8">
              <ResultDetails 
                answers={answers}
                totalTime={totalTime}
              />

              <div className="text-center">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Start New Quiz
                </button>
              </div>

              <Leaderboard
                scores={[
                  {
                    did: 'did:example:123',
                    name: 'Player 1',
                    points: score,
                    correctAnswers: answers.filter(
                      (a) => a.question.correctAnswer === a.selected
                    ).length,
                    totalTime,
                  },
                  // More scores will be fetched from DWN
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
