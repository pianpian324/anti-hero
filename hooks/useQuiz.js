'use client';

import { useState, useEffect } from 'react';
import quizData from '@/data/quizQuestions.json';

export function useQuiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30); // 每题时间30秒

  // 初始化题目
  useEffect(() => {
    const initQuestions = () => {
      try {
        // 从所有题目中随机选择10道
        const allQuestions = [...quizData.questions];
        const selectedQuestions = [];
        
        for (let i = 0; i < 10; i++) {
          const randomIndex = Math.floor(Math.random() * allQuestions.length);
          selectedQuestions.push(allQuestions.splice(randomIndex, 1)[0]);
        }

        setQuestions(selectedQuestions);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize questions:', error);
        setIsLoading(false);
      }
    };

    initQuestions();
  }, []);

  // 处理答案选择
  const handleAnswerSelect = (questionId, selectedOption) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
    setIsTimerActive(false); // 选择答案后停止计时器
  };

  // 处理超时
  const handleTimeout = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !selectedAnswers[currentQuestion.id]) {
      // 超时自动记录为未答题
      handleAnswerSelect(currentQuestion.id, null);
    }
  };

  // 检查答案是否正确
  const checkAnswer = (questionId, selectedOption) => {
    if (!selectedOption) return false; // 超时或未答题算错误
    const question = questions.find(q => q.id === questionId);
    return question?.correctAnswer === selectedOption;
  };

  // 计算当前得分
  const calculateScore = () => {
    let totalScore = 0;
    Object.entries(selectedAnswers).forEach(([questionId, answer]) => {
      if (checkAnswer(Number(questionId), answer)) {
        totalScore += 10;
      }
    });
    setScore(totalScore);
    return totalScore;
  };

  // 移动到下一题
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsTimerActive(true); // 重新激活计时器
      setTimeLeft(30); // 重置时间
      return true;
    }
    return false;
  };

  // 移动到上一题
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsTimerActive(false); // 查看已答题目时停止计时器
      return true;
    }
    return false;
  };

  // 获取当前题目
  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };

  // 获取当前进度
  const getProgress = () => {
    return {
      current: currentQuestionIndex + 1,
      total: questions.length
    };
  };

  // 计时器
  useEffect(() => {
    let timer;
    if (isTimerActive) {
      timer = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft(prev => prev - 1);
        } else {
          handleTimeout();
        }
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isTimerActive, timeLeft]);

  return {
    isLoading,
    currentQuestion: getCurrentQuestion(),
    selectedAnswers,
    score,
    progress: getProgress(),
    isTimerActive,
    timeLeft,
    handleAnswerSelect,
    handleTimeout,
    checkAnswer,
    calculateScore,
    nextQuestion,
    previousQuestion
  };
}
