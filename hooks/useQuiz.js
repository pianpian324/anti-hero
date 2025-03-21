'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import quizData from '@/data/quizQuestions.json';

export function useQuiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const transitionTimeoutRef = useRef(null);

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

  // 清理定时器
  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  // 自动跳转到下一题
  const autoAdvance = useCallback(() => {
    clearTransitionTimeout();
    
    transitionTimeoutRef.current = setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsTimerActive(true);
        setTimeLeft(30);
      }
      clearTransitionTimeout();
    }, 600);
  }, [currentQuestionIndex, questions.length, clearTransitionTimeout]);

  // 处理答案选择
  const handleAnswerSelect = useCallback((questionId, selectedOption) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
    setIsTimerActive(false);
    autoAdvance();
  }, [autoAdvance]);

  // 处理超时
  const handleTimeout = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !selectedAnswers[currentQuestion.id]) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: null
      }));
      setIsTimerActive(false);
      autoAdvance();
    }
  }, [currentQuestionIndex, questions, selectedAnswers, autoAdvance]);

  // 检查答案是否正确
  const checkAnswer = useCallback((questionId, selectedOption) => {
    if (!selectedOption) return false;
    const question = questions.find(q => q.id === questionId);
    return question?.correctAnswer === selectedOption;
  }, [questions]);

  // 计算当前得分
  const calculateScore = useCallback(() => {
    let totalScore = 0;
    Object.entries(selectedAnswers).forEach(([questionId, answer]) => {
      if (checkAnswer(Number(questionId), answer)) {
        totalScore += 10;
      }
    });
    setScore(totalScore);
    return totalScore;
  }, [selectedAnswers, checkAnswer]);

  // 移动到下一题
  const nextQuestion = useCallback(() => {
    clearTransitionTimeout();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsTimerActive(true);
      setTimeLeft(30);
      return true;
    }
    return false;
  }, [currentQuestionIndex, questions.length, clearTransitionTimeout]);

  // 移动到上一题
  const previousQuestion = useCallback(() => {
    clearTransitionTimeout();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsTimerActive(false);
      return true;
    }
    return false;
  }, [currentQuestionIndex, clearTransitionTimeout]);

  // 获取当前题目
  const getCurrentQuestion = useCallback(() => {
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  // 获取当前进度
  const getProgress = useCallback(() => {
    return {
      current: currentQuestionIndex + 1,
      total: questions.length
    };
  }, [currentQuestionIndex, questions.length]);

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
  }, [isTimerActive, timeLeft, handleTimeout]);

  // 清理副作用
  useEffect(() => {
    return () => {
      clearTransitionTimeout();
    };
  }, [clearTransitionTimeout]);

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
