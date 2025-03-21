'use client';

import React from 'react';
import UserProfile from '@/components/UserProfile';
import { ccc } from "@ckb-ccc/connector-react";
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/SharedLayout';
import { useQuiz } from '@/hooks/useQuiz';
import QuizTimer from '@/components/QuizTimer';

export default function QuizGame() {
  const router = useRouter();
  const { wallet } = ccc.useCcc();
  const signer = ccc.useSigner();
  const [address, setAddress] = React.useState("");

  // 使用自定义 hook 管理题目
  const {
    isLoading,
    currentQuestion,
    selectedAnswers,
    progress,
    isTimerActive,
    isFirstRoundComplete,
    isQuestionCompleted,
    isQuestionTimedOut,
    handleAnswerSelect,
    handleTimeout,
    checkAnswer,
    nextQuestion,
    previousQuestion
  } = useQuiz();

  React.useEffect(() => {
    if (!signer) {
      router.push('/');
      return;
    }

    (async () => {
      const addr = await signer.getRecommendedAddress();
      setAddress(addr);
    })();
  }, [signer, router]);

  // 处理选项点击
  const handleOptionClick = (option) => {
    if (currentQuestion && !selectedAnswers[currentQuestion.id]) {
      handleAnswerSelect(currentQuestion.id, option);
    }
  };

  // 获取选项的样式
  const getOptionStyle = (option) => {
    if (!currentQuestion) return '';
    
    const questionId = currentQuestion.id;
    const isCompleted = isQuestionCompleted(questionId);
    const isSelected = selectedAnswers[questionId] === option;
    const hasAnswered = selectedAnswers[questionId] !== undefined;
    const isCorrect = currentQuestion.correctAnswer === option;
    
    // 基础样式
    let baseStyle = 'p-4 text-left rounded-lg border transition-all transform';
    
    // 如果题目已完成（包括超时）
    if (isCompleted) {
      if (isCorrect) {
        // 正确答案始终显示绿色
        return `${baseStyle} bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700`;
      }
      if (isSelected) {
        // 选择的错误答案显示红色
        return `${baseStyle} bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700`;
      }
      // 其他选项变暗
      return `${baseStyle} opacity-50 border-gray-200 dark:border-gray-600`;
    }

    // 未完成的题目
    if (!hasAnswered) {
      return `${baseStyle} border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-[1.01]`;
    }

    return baseStyle;
  };

  // 获取题目状态文本
  const getQuestionStatus = () => {
    if (!currentQuestion) return '';
    
    const questionId = currentQuestion.id;
    if (isQuestionTimedOut(questionId)) {
      return '(超时未答)';
    }
    if (isQuestionCompleted(questionId)) {
      const isCorrect = checkAnswer(questionId, selectedAnswers[questionId]);
      return isCorrect ? '(答对了)' : '(答错了)';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Header />
          <div className="absolute top-4 right-4">
            <UserProfile />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto p-8 pt-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Web5 Quiz Challenge
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Answer questions and compete with others!
          </p>
        </div>

        {/* 主游戏区域 */}
        <div className="w-full">
          <div className="quiz-card p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Question {progress.current}/{progress.total}
                  <span className="ml-2 text-base font-normal text-gray-600 dark:text-gray-400">
                    {getQuestionStatus()}
                  </span>
                </div>
              </div>
              {!isFirstRoundComplete && !isQuestionCompleted(currentQuestion?.id) && (
                <QuizTimer 
                  duration={6} 
                  onTimeout={handleTimeout}
                  isActive={isTimerActive && !selectedAnswers[currentQuestion?.id]}
                />
              )}
            </div>

            {/* 问题区域 */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-lg text-gray-900 dark:text-white animate-pulse">
                  Loading question...
                </div>
              ) : (
                <div className="text-lg text-gray-900 dark:text-white">
                  {currentQuestion?.question}
                </div>
              )}

              {/* 选项区域 */}
              <div className="grid grid-cols-1 gap-4 mt-6">
                {!isLoading && currentQuestion && Object.entries(currentQuestion.options).map(([key, value]) => (
                  <button
                    key={key}
                    className={getOptionStyle(key)}
                    onClick={() => handleOptionClick(key)}
                    disabled={isQuestionCompleted(currentQuestion.id) || isFirstRoundComplete}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {key}.
                    </span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {value}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 游戏控制区域 */}
        <div className="w-full flex justify-between items-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Exit Game
          </button>
          <div className="flex gap-4">
            <button
              onClick={previousQuestion}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
              disabled={progress.current === 1}
            >
              Previous
            </button>
            <button
              onClick={nextQuestion}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50"
              disabled={!isQuestionCompleted(currentQuestion?.id) || progress.current === progress.total}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
