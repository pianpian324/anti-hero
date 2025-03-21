'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import quizData from '@/data/quizQuestions.json';

export function useQuiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [questionStates, setQuestionStates] = useState({});
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeBonus, setTimeBonus] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isFirstRoundComplete, setIsFirstRoundComplete] = useState(false);
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

  // 检查答案是否正确
  const checkAnswer = useCallback((questionId, selectedOption) => {
    if (!selectedOption) return false;
    const question = questions.find(q => q.id === questionId);
    return question?.correctAnswer === selectedOption;
  }, [questions]);

  // 检查题目是否已完成
  const isQuestionCompleted = useCallback((questionId) => {
    return questionStates[questionId]?.completed || false;
  }, [questionStates]);

  // 检查题目是否超时
  const isQuestionTimedOut = useCallback((questionId) => {
    return questionStates[questionId]?.timedOut || false;
  }, [questionStates]);

  // 自动跳转到下一题
  const autoAdvance = useCallback(() => {
    clearTransitionTimeout();
    
    transitionTimeoutRef.current = setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsTimerActive(true);
        setTimeLeft(5);
      } else {
        // 首轮答题完成
        setIsFirstRoundComplete(true);
        setIsTimerActive(false);
      }
      clearTransitionTimeout();
    }, 500);
  }, [currentQuestionIndex, questions.length, clearTransitionTimeout]);

  // 处理答案选择
  const handleAnswerSelect = useCallback((questionId, selectedOption) => {
    // 如果题目已完成或首轮已结束，不允许作答
    if (isQuestionCompleted(questionId) || isFirstRoundComplete) {
      return;
    }

    const isCorrect = checkAnswer(questionId, selectedOption);
    const currentTimeBonus = Math.max(0, timeLeft * 2); // 剩余时间 × 2 作为时间奖励

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
    
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        completed: true,
        timedOut: false
      }
    }));

    // 更新分数
    if (isCorrect) {
      setScore(prev => prev + 10 + currentTimeBonus);
      setCorrectAnswers(prev => prev + 1);
    }
    setTimeBonus(prev => prev + currentTimeBonus);

    setIsTimerActive(false);
    autoAdvance();
  }, [autoAdvance, isQuestionCompleted, isFirstRoundComplete, checkAnswer, timeLeft]);

  // 处理超时
  const handleTimeout = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !selectedAnswers[currentQuestion.id] && !isQuestionCompleted(currentQuestion.id)) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: null
      }));

      setQuestionStates(prev => ({
        ...prev,
        [currentQuestion.id]: {
          completed: true,
          timedOut: true
        }
      }));

      setIsTimerActive(false);
      autoAdvance();
    }
  }, [currentQuestionIndex, questions, selectedAnswers, autoAdvance, isQuestionCompleted]);

  // 移动到下一题
  const nextQuestion = useCallback(() => {
    clearTransitionTimeout();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // 只在首轮未完成且题目未完成时激活计时器
      const nextQuestionId = questions[currentQuestionIndex + 1]?.id;
      if (!isFirstRoundComplete && !isQuestionCompleted(nextQuestionId)) {
        setIsTimerActive(true);
        setTimeLeft(5);
      } else {
        setIsTimerActive(false);
      }
      return true;
    }
    return false;
  }, [currentQuestionIndex, questions, isFirstRoundComplete, isQuestionCompleted]);

  // 移动到上一题
  const previousQuestion = useCallback(() => {
    clearTransitionTimeout();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsTimerActive(false);
      return true;
    }
    return false;
  }, [currentQuestionIndex]);

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
      if (timer) {
        clearInterval(timer);
      }
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
    correctAnswers,
    timeBonus,
    progress: getProgress(),
    isTimerActive,
    isFirstRoundComplete,
    isQuestionCompleted,
    isQuestionTimedOut,
    handleAnswerSelect,
    handleTimeout,
    checkAnswer,
    nextQuestion,
    previousQuestion,
    questions
  };
}
