'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCreditCard, FaArrowUp, FaArrowDown, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaCloudUploadAlt, FaFileAlt, FaSnowflake } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getCreditScore, updateCreditScore, completeTask } from '@/lib/creditService';
import { addPoints } from '@/lib/gamificationService';

export default function CreditBuilderPage() {
  const { user } = useAuth();
  const [creditScore, setCreditScore] = useState(680);
  const [previousScore, setPreviousScore] = useState(650);
  const [loading, setLoading] = useState(true);
  const [reportFileName, setReportFileName] = useState<string | null>(null);
  const [reportAnalysis, setReportAnalysis] = useState<{
    score?: number;
    positives: string[];
    warnings: string[];
    recommendations: string[];
  } | null>(null);
  const [reportText, setReportText] = useState<string | null>(null);
  const [llmAdvice, setLlmAdvice] = useState<string | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const scoreChange = creditScore - previousScore;

  const creditFactors = [
    { name: 'Payment History', percentage: 85, status: 'good', impact: 35 },
    { name: 'Credit Utilization', percentage: 45, status: 'excellent', impact: 30 },
    { name: 'Credit Age', percentage: 60, status: 'fair', impact: 15 },
    { name: 'Credit Mix', percentage: 70, status: 'good', impact: 10 },
    { name: 'New Credit', percentage: 80, status: 'good', impact: 10 },
  ];

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Pay off credit card balance', completed: true, points: 50 },
    { id: 2, title: 'Dispute error on credit report', completed: false, points: 75 },
    { id: 3, title: 'Set up autopay for loans', completed: false, points: 30 },
    { id: 4, title: 'Reduce credit utilization below 30%', completed: false, points: 100 },
  ]);

  // Load credit score from Firebase
  useEffect(() => {
    const loadCreditData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getCreditScore(user.uid);
        if (result.success && result.data) {
          setCreditScore(result.data.currentScore);
          setPreviousScore(result.data.previousScore);

          // Update tasks with completed status
          if (result.data.tasks) {
            setTasks(prev => prev.map(task => {
              const savedTask = result.data?.tasks.find(t => t.id === task.id);
              return savedTask ? { ...task, completed: savedTask.completed } : task;
            }));
          }
        }
      } catch (error) {
        console.error('Error loading credit data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCreditData();
  }, [user]);

  const handleTaskComplete = async (taskId: number, taskPoints: number) => {
    if (!user) return;

    // Update UI optimistically
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));

    try {
      await completeTask(user.uid, taskId);
      await addPoints(user.uid, taskPoints);
    } catch (error) {
      console.error('Error completing task:', error);
      // Revert on error
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: false } : task
      ));
    }
  };

  const tips = [
    {
      title: 'Keep Credit Utilization Low',
      description: 'Try to use less than 30% of your available credit to boost your score.',
      icon: FaLightbulb,
    },
    {
      title: 'Pay Bills On Time',
      description: 'Payment history is the most important factor affecting your credit score.',
      icon: FaCheckCircle,
    },
    {
      title: 'Monitor Your Credit Report',
      description: 'Check your credit report regularly for errors and dispute them promptly.',
      icon: FaExclamationTriangle,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-500';
    if (score >= 670) return 'text-amber';
    return 'text-red-500';
  };

  const getStatusColor = (status: string) => {
    if (status === 'excellent') return 'bg-green-500';
    if (status === 'good') return 'bg-amber';
    return 'bg-yellow-500';
  };

  const analyzeReportText = (text: string) => {
    const normalized = text.replace(/\s+/g, ' ').toLowerCase();
    const positives: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const scoreMatch = normalized.match(/(?:credit score|score)\D{0,12}(\d{3})/);
    const score = scoreMatch ? Number(scoreMatch[1]) : undefined;

    const utilizationMatch = normalized.match(/utilization\D{0,10}(\d{1,3})%/);
    if (utilizationMatch) {
      const utilization = Number(utilizationMatch[1]);
      if (utilization > 30) {
        warnings.push(`Credit utilization appears high (${utilization}%).`);
        recommendations.push('Aim to keep utilization under 30% by paying down balances.');
      } else {
        positives.push(`Credit utilization is healthy at ${utilization}%.`);
      }
    }

    if (/late payment|past due|30 day|60 day|90 day/.test(normalized)) {
      warnings.push('Late or past-due payments detected.');
      recommendations.push('Set up autopay or reminders to avoid missed payments.');
    } else {
      positives.push('No late payment indicators found.');
    }

    if (/collection|charge[- ]?off|bankrupt|foreclosure|repossession/.test(normalized)) {
      warnings.push('Collections or derogatory marks detected.');
      recommendations.push('Dispute inaccuracies and negotiate settlements where possible.');
    }

    const inquiryCount = (normalized.match(/hard inquiry|inquiry/g) || []).length;
    if (inquiryCount >= 4) {
      warnings.push(`Multiple inquiries detected (${inquiryCount}).`);
      recommendations.push('Limit new credit applications to reduce inquiry impact.');
    }

    if (/average age|credit age|oldest account/.test(normalized)) {
      positives.push('Credit age information found—keep older accounts open when possible.');
    }

    if (positives.length === 0 && warnings.length === 0) {
      recommendations.push('We could not detect key indicators. Consider uploading a detailed report or PDF export.');
    }

    if (typeof score === 'number') {
      if (score >= 750) {
        positives.push(`Score range detected: ${score} (Excellent).`);
      } else if (score >= 670) {
        positives.push(`Score range detected: ${score} (Good).`);
        recommendations.push('Focus on lowering utilization to push into Excellent range.');
      } else {
        warnings.push(`Score range detected: ${score} (Fair).`);
        recommendations.push('Pay on time and reduce balances to build momentum.');
      }
    }

    return { score, positives, warnings, recommendations };
  };

  const extractPdfText = async (file: File) => {
    const pdfjs = await import('pdfjs-dist');
    const pdfjsLib: any = pdfjs;
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    const typedArray = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    let text = '';

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += `${pageText}\n`;
    }

    return text;
  };

  const handleReportUpload = async (file: File | null) => {
    if (!file) return;
    setReportError(null);
    setReportAnalysis(null);
    setReportText(null);
    setLlmAdvice(null);
    setLlmError(null);
    setReportLoading(true);
    setReportFileName(file.name);

    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        text = await extractPdfText(file);
      } else {
        text = await file.text();
      }

      if (!text || text.trim().length < 50) {
        throw new Error('The report content looks empty. Please upload a full report.');
      }

      const trimmed = text.trim();
      setReportText(trimmed);
      setReportAnalysis(analyzeReportText(trimmed));
    } catch (error) {
      console.error('Report analysis failed:', error);
      setReportError('We could not read that report. Try exporting as PDF or TXT and uploading again.');
    } finally {
      setReportLoading(false);
    }
  };

  const requestLlmAdvice = async () => {
    if (!reportText) {
      setLlmError('Upload a report first so we can generate advice.');
      return;
    }

    setLlmLoading(true);
    setLlmError(null);
    setLlmAdvice(null);

    try {
      const response = await fetch('/api/credit-report-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: reportText.slice(0, 12000),
          score: reportAnalysis?.score ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate advice.');
      }

      const data = await response.json();
      setLlmAdvice(data.advice ?? 'No advice generated.');
    } catch (error) {
      console.error('LLM advice failed:', error);
      setLlmError('We could not generate advice right now. Please try again.');
    } finally {
      setLlmLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-secondary mb-4 font-serif">
            Credit Builder Dashboard
          </h1>
          <p className="text-xl text-darkwood">
            Track your credit journey and build a stronger financial future
          </p>
        </motion.div>

        {/* Show login message if not authenticated */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-8 frosted-glass rounded-xl p-6 text-center"
          >
            <p className="text-darkwood mb-4">
              Please log in to track your credit score and progress!
            </p>
            <a
              href="/login"
              className="inline-block bg-primary hover:bg-amber text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              Log In
            </a>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && user && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-darkwood">Loading your credit data...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>

        {/* Credit Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="frosted-glass rounded-2xl p-8 shadow-2xl mb-8 bg-gradient-to-br from-primary to-secondary"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-white mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <FaCreditCard className="text-5xl text-accent" />
                <div>
                  <h2 className="text-2xl font-bold font-serif">Your Credit Score</h2>
                  <p className="text-accent">Updated today</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className={`text-7xl font-bold ${getScoreColor(creditScore)} mb-2`}
              >
                {creditScore}
              </motion.div>
              <div className={`flex items-center justify-center space-x-2 text-lg ${scoreChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {scoreChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                <span>{Math.abs(scoreChange)} points this month</span>
              </div>
              <div className="mt-4 text-accent text-sm">
                Range: 300 - 850
              </div>
            </div>

            <div className="mt-6 md:mt-0">
              <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-accent text-sm mb-2">Credit Rating</div>
                <div className="text-white text-2xl font-bold">
                  {creditScore >= 750 ? 'Excellent' : creditScore >= 670 ? 'Good' : 'Fair'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Credit Factors */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="frosted-glass rounded-2xl p-8 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-secondary mb-6 font-serif">
              Credit Factors
            </h3>
            <div className="space-y-6">
              {creditFactors.map((factor, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-secondary">{factor.name}</span>
                    <span className="text-primary">{factor.percentage}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`${getStatusColor(factor.status)} h-3 rounded-full`}
                      />
                    </div>
                    <span className={`text-sm capitalize px-3 py-1 rounded-full ${
                      factor.status === 'excellent' ? 'bg-green-100 text-green-700' :
                      factor.status === 'good' ? 'bg-amber bg-opacity-20 text-primary' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {factor.status}
                    </span>
                  </div>
                  <div className="text-xs text-darkwood mt-1">
                    Impact: {factor.impact}% of score
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Personalized Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="frosted-glass rounded-2xl p-8 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-secondary mb-6 font-serif">
              Your Action Plan
            </h3>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => !task.completed && user && handleTaskComplete(task.id, task.points)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    task.completed
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-amber hover:border-primary cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {task.completed ? (
                        <FaCheckCircle className="text-green-500 text-xl mt-1" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-primary rounded-full mt-1" />
                      )}
                      <div>
                        <p className={`font-medium ${task.completed ? 'text-green-700 line-through' : 'text-secondary'}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-primary mt-1">+{task.points} points</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-primary to-amber rounded-lg text-white text-center">
              <div className="text-3xl font-bold mb-1">
                {tasks.filter(t => t.completed).length} / {tasks.length}
              </div>
              <div className="text-sm">Tasks Completed</div>
            </div>
          </motion.div>
        </div>

        {/* Credit Report Upload */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="frosted-glass rounded-2xl p-8 shadow-xl mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-secondary mb-2 font-serif">
                Upload Your Credit Report
              </h3>
              <p className="text-darkwood">
                Drop a PDF or TXT report to get instant insights. Analysis runs in your browser.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-primary">
              <FaSnowflake />
              <span>Private, secure, and local</span>
            </div>
          </div>

          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <label className="relative border-2 border-dashed border-amber rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white/80 hover:border-primary transition-all cursor-pointer">
              <FaCloudUploadAlt className="text-4xl text-primary mb-3" />
              <span className="font-semibold text-secondary">Click to upload</span>
              <span className="text-sm text-darkwood mt-2">PDF, TXT, or CSV</span>
              <input
                type="file"
                accept=".pdf,.txt,.csv"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(event) => handleReportUpload(event.target.files?.[0] ?? null)}
              />
              {reportFileName && (
                <div className="mt-4 flex items-center space-x-2 text-sm text-primary">
                  <FaFileAlt />
                  <span>{reportFileName}</span>
                </div>
              )}
            </label>

            <div className="bg-white/80 rounded-2xl p-6 shadow-inner">
              {reportLoading && (
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                  <p className="mt-3 text-darkwood">Analyzing your report...</p>
                </div>
              )}

              {!reportLoading && reportError && (
                <div className="text-red-600 font-medium">{reportError}</div>
              )}

              {!reportLoading && !reportError && !reportAnalysis && (
                <div className="text-darkwood">
                  Upload a report to see personalized insights and recommendations.
                </div>
              )}

              {!reportLoading && reportAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-darkwood">Detected Score</div>
                    <div className="text-2xl font-bold text-secondary">
                      {reportAnalysis.score ?? 'N/A'}
                    </div>
                  </div>

                  {reportAnalysis.positives.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2">Positive Signals</h4>
                      <ul className="space-y-2 text-sm text-green-700">
                        {reportAnalysis.positives.map((item, index) => (
                          <li key={`positive-${index}`} className="flex items-start space-x-2">
                            <FaCheckCircle className="mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reportAnalysis.warnings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-amber mb-2">Areas to Improve</h4>
                      <ul className="space-y-2 text-sm text-amber">
                        {reportAnalysis.warnings.map((item, index) => (
                          <li key={`warning-${index}`} className="flex items-start space-x-2">
                            <FaExclamationTriangle className="mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reportAnalysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-primary mb-2">Recommended Actions</h4>
                      <ul className="space-y-2 text-sm text-darkwood">
                        {reportAnalysis.recommendations.map((item, index) => (
                          <li key={`rec-${index}`} className="flex items-start space-x-2">
                            <FaLightbulb className="text-primary mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-amber/30">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-secondary">AI Financial Advice</h4>
                        <p className="text-xs text-darkwood">
                          Uses your report details to suggest next best actions.
                        </p>
                      </div>
                      <button
                        onClick={requestLlmAdvice}
                        disabled={llmLoading}
                        className="bg-primary hover:bg-amber text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-70"
                      >
                        {llmLoading ? 'Generating...' : 'Generate Advice'}
                      </button>
                    </div>

                    {llmError && (
                      <div className="mt-3 text-sm text-red-600">{llmError}</div>
                    )}

                    {llmAdvice && (
                      <div className="mt-3 p-4 bg-white/80 rounded-xl text-sm text-darkwood whitespace-pre-line">
                        {llmAdvice}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="frosted-glass rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-2xl font-bold text-secondary mb-6 font-serif">
            Expert Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <Icon className="text-4xl text-primary mb-4" />
                  <h4 className="text-lg font-bold text-secondary mb-2">{tip.title}</h4>
                  <p className="text-darkwood text-sm">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
        </>
        )}
      </div>
    </div>
  );
}
