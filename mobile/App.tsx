import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl, Modal } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabaseクライアント
const createSupabaseClient = () => {
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://placeholder.supabase.co'
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'placeholder-key'
  
  console.log('Supabase設定:', { 
    supabaseUrl, 
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    keyStart: supabaseAnonKey?.substring(0, 20) || 'none'
  });
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    db: {
      schema: 'public'
    }
  })
}

let supabase = createSupabaseClient()

// テストモード用の会社ID
const TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000001'

export default function App() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [quizResults, setQuizResults] = useState<any>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);

  // 初期化
  useEffect(() => {
    loadQuizzes();
  }, []);

  // クイズデータを読み込み
  const loadQuizzes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('クイズデータを読み込み中...');
      console.log('Supabase URL:', Constants.expoConfig?.extra?.supabaseUrl);
      console.log('Supabase Key:', Constants.expoConfig?.extra?.supabaseAnonKey ? '設定済み' : '未設定');
      console.log('Supabase Key (first 20 chars):', Constants.expoConfig?.extra?.supabaseAnonKey?.substring(0, 20));
      
      // 環境変数チェック
      if (!Constants.expoConfig?.extra?.supabaseUrl || 
          Constants.expoConfig?.extra?.supabaseUrl === 'https://placeholder.supabase.co' ||
          !Constants.expoConfig?.extra?.supabaseAnonKey ||
          Constants.expoConfig?.extra?.supabaseAnonKey === 'placeholder-key') {
        throw new Error('Supabaseの環境変数が設定されていません。app.config.jsでsupabaseUrlとsupabaseAnonKeyを設定してください。');
      }
      
      // アクティブなクイズを取得（statusフィールドの制限を緩和）
      const { data: activeQuizzes, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('company_id', TEST_COMPANY_ID)
        .order('created_at', { ascending: false })
      
      if (quizError) {
        console.error('クイズ読み込みエラー:', quizError);
        throw new Error(`クイズ読み込みエラー: ${quizError.message}`);
      }
      
      console.log('読み込まれたクイズ:', activeQuizzes);
      console.log('クイズの数:', activeQuizzes?.length || 0);
      
      if (activeQuizzes && activeQuizzes.length > 0) {
        console.log('最初のクイズの詳細:', activeQuizzes[0]);
      }
      
      // tray_itemsから質問データを取得
      console.log('tray_itemsから質問データを取得中...');
      const { data: trayItems, error: trayItemsError } = await supabase
        .from('tray_items')
        .select('*')
        .eq('company_id', TEST_COMPANY_ID)
        .eq('status', 'draft');
      
      if (trayItemsError) {
        console.warn('tray_items取得エラー:', trayItemsError);
      }
      
      console.log('tray_itemsデータ:', trayItems);
      
      // 各クイズの質問を個別に取得
      const quizzesWithQuestions = [];
      for (const quiz of activeQuizzes || []) {
        console.log(`クイズ ${quiz.id} の質問を取得中...`);
        
        // tray_itemsから対応する質問データを探す
        let questions = [];
        if (trayItems) {
          for (const trayItem of trayItems) {
            if (trayItem.content && trayItem.content.questions) {
              // 質問データを整形
              questions = trayItem.content.questions.map((q: any, index: number) => ({
                id: `temp-${index}`,
                question_text: q.question || q.question_text,
                options: q.options || [],
                correct_answer: q.correct_answer || q.correct,
                explanation: q.explanation || ''
              }));
              break; // 最初に見つかったtray_itemを使用
            }
          }
        }
        
        console.log(`クイズ ${quiz.id} の質問数:`, questions?.length || 0);
        if (questions && questions.length > 0) {
          console.log(`クイズ ${quiz.id} の最初の質問:`, questions[0]);
        }
        
        quizzesWithQuestions.push({
          ...quiz,
          questions: questions || []
        });
      }
      
      console.log('質問付きクイズ:', quizzesWithQuestions);
      
      // デバッグ用：基本的なテーブル確認
      console.log('=== データベーステーブル確認 ===');
      
      // 基本的なテーブルの存在確認
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*');
        console.log('questionsテーブル:', questionsError ? 'エラー' : `データ数: ${questionsData?.length || 0}`);
      } catch (e) {
        console.log('questionsテーブル: 存在しません');
      }
      
      try {
        const { data: quizQuestionsData, error: quizQuestionsError } = await supabase
          .from('quiz_questions')
          .select('*');
        console.log('quiz_questionsテーブル:', quizQuestionsError ? 'エラー' : `データ数: ${quizQuestionsData?.length || 0}`);
      } catch (e) {
        console.log('quiz_questionsテーブル: 存在しません');
      }
      
      // クイズデータを整形
      const formattedQuizzes = quizzesWithQuestions.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        source: 'Quiz', // 配信ビルダーで作成されたクイズ
        deadline: quiz.deadline,
        questions: quiz.questions?.length || 0,
        completed: false, // 完了状態は後で実装
        requiresAttestation: quiz.requires_attestation,
        created_at: quiz.created_at,
        questionData: quiz.questions || [] // 質問データを追加
      }));
      
      setQuizzes(formattedQuizzes);
      console.log('整形されたクイズデータ:', formattedQuizzes);
      
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      setError(error instanceof Error ? error.message : 'データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // プルリフレッシュ処理
  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuizzes();
    setRefreshing(false);
  };

  // 手動更新処理
  const handleRefresh = async () => {
    await loadQuizzes();
  };

  const handleQuizPress = (quiz: any) => {
    console.log('クイズがタップされました:', quiz);
    setSelectedQuiz(quiz);
    setIsQuizModalVisible(true);
    setIsQuizActive(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResults(null);
  };

  // クイズ開始
  const startQuiz = async () => {
    if (!selectedQuiz || !selectedQuiz.questionData || selectedQuiz.questionData.length === 0) {
      Alert.alert('エラー', '質問データがありません');
      return;
    }

    try {
      // クイズ割り当てレコードを作成
      await createQuizAssignment();
      
      setIsQuizActive(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizResults(null);
    } catch (error) {
      console.error('クイズ開始エラー:', error);
      Alert.alert('エラー', 'クイズの開始に失敗しました');
    }
  };

  // クイズ割り当てレコードを作成
  const createQuizAssignment = async () => {
    if (!selectedQuiz) return;

    try {
      const testUserId = '00000000-0000-0000-0000-000000000001';

      // 既存の割り当てがあるかチェック
      const { data: existingAssignment, error: checkError } = await supabase
        .from('quiz_assignments')
        .select('*')
        .eq('quiz_id', selectedQuiz.id)
        .eq('user_id', testUserId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('割り当てチェックエラー:', checkError);
        throw new Error(`割り当てチェックエラー: ${checkError.message}`);
      }

      if (existingAssignment) {
        console.log('既存の割り当てがあります:', existingAssignment.id);
        return;
      }

      // 新しい割り当てを作成
      const { data: assignment, error: createError } = await supabase
        .from('quiz_assignments')
        .insert({
          quiz_id: selectedQuiz.id,
          user_id: testUserId,
          status: 'in_progress',
          assigned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('割り当て作成エラー:', createError);
        throw new Error(`割り当て作成エラー: ${createError.message}`);
      }

      console.log('クイズ割り当てが作成されました:', assignment.id);

    } catch (error) {
      console.error('割り当て作成エラー:', error);
      throw error;
    }
  };

  // 回答選択
  const selectAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // 次の質問へ
  const nextQuestion = () => {
    if (currentQuestionIndex < selectedQuiz.questionData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 最後の質問の場合は結果を表示
      calculateResults();
    }
  };

  // 前の質問へ
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // 結果計算
  const calculateResults = async () => {
    if (!selectedQuiz || !selectedQuiz.questionData) return;

    let correctCount = 0;
    const results = selectedQuiz.questionData.map((question: any, index: number) => {
      const selectedAnswer = selectedAnswers[question.id];
      const isCorrect = selectedAnswer === question.correct_answer;
      if (isCorrect) correctCount++;
      
      return {
        question: question.question_text,
        selectedAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctCount / selectedQuiz.questionData.length) * 100);
    
    const quizResult = {
      score,
      correctCount,
      totalQuestions: selectedQuiz.questionData.length,
      results
    };
    
    setQuizResults(quizResult);

    // 結果をデータベースに保存
    try {
      await saveQuizResults(quizResult);
    } catch (error) {
      console.error('結果保存エラー:', error);
      Alert.alert('警告', '結果の保存に失敗しました。管理システムに反映されない可能性があります。');
    }
  };

  // クイズ結果をデータベースに保存
  const saveQuizResults = async (results: any) => {
    if (!selectedQuiz) return;

    try {
      console.log('クイズ結果を保存中...', {
        quiz_id: selectedQuiz.id,
        score: results.score,
        total_questions: results.totalQuestions
      });

      // テスト用のユーザーID（実際のアプリでは認証システムから取得）
      const testUserId = '00000000-0000-0000-0000-000000000001';

      // 1. クイズの回答を保存
      const { data: response, error: responseError } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: selectedQuiz.id,
          user_id: testUserId,
          answers: selectedAnswers,
          score: results.score,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (responseError) {
        console.error('回答保存エラー:', responseError);
        throw new Error(`回答保存エラー: ${responseError.message}`);
      }

      console.log('回答が保存されました:', response.id);

      // 2. クイズ割り当てのステータスを更新
      const { error: assignmentError } = await supabase
        .from('quiz_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          score: results.score
        })
        .eq('quiz_id', selectedQuiz.id)
        .eq('user_id', testUserId);

      if (assignmentError) {
        console.warn('割り当て更新エラー（無視）:', assignmentError);
        // 割り当ての更新に失敗しても回答の保存は成功しているので続行
      } else {
        console.log('クイズ割り当てが更新されました');
      }

      // 3. 管理システム用のAPIにも送信（Webアプリと連携）
      try {
        const webApiResponse = await fetch('http://localhost:3000/api/quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quiz_id: selectedQuiz.id,
            user_id: testUserId,
            answers: selectedAnswers,
            score: results.score,
            completed_at: new Date().toISOString()
          })
        });

        if (webApiResponse.ok) {
          console.log('Web APIにも結果が送信されました');
        } else {
          console.warn('Web API送信エラー:', webApiResponse.status);
        }
      } catch (webApiError) {
        console.warn('Web API送信エラー（無視）:', webApiError);
        // Web APIの送信に失敗してもローカルDBへの保存は成功しているので続行
      }

      console.log('クイズ結果の保存が完了しました');
      
    } catch (error) {
      console.error('結果保存エラー:', error);
      throw error;
    }
  };

  // クイズをリセット
  const resetQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResults(null);
  };

  // クイズを閉じる
  const closeQuiz = () => {
    setIsQuizModalVisible(false);
    setIsQuizActive(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setSelectedQuiz(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>OrgShift Quiz</Text>
        <Text style={styles.subtitle}>組織の理解を深めるクイズ</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? '更新中...' : '🔄 更新'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
      >
        <Text style={styles.sectionTitle}>新着クイズ</Text>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>エラー: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadQuizzes}>
              <Text style={styles.retryButtonText}>再試行</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading && quizzes.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>クイズデータを読み込み中...</Text>
          </View>
        ) : quizzes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>新着クイズがありません</Text>
            <Text style={styles.emptySubText}>配信ビルダーでクイズを作成してください</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadQuizzes}>
              <Text style={styles.retryButtonText}>再読み込み</Text>
            </TouchableOpacity>
          </View>
        ) : (
          quizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz.id}
              style={[
                styles.quizCard,
                quiz.completed && styles.completedCard
              ]}
              onPress={() => {
                console.log('TouchableOpacityがタップされました:', quiz.id);
                handleQuizPress(quiz);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.quizTitle} numberOfLines={2}>
                  {quiz.title}
                </Text>
                <View style={[
                  styles.sourceTag,
                  quiz.source === 'News' && styles.newsTag,
                  quiz.source === 'Policy' && styles.policyTag,
                  quiz.source === 'Quiz' && styles.quizTag,
                  quiz.source === 'Manual' && styles.manualTag,
                ]}>
                  <Text style={styles.sourceText}>{quiz.source}</Text>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.questionsText}>{quiz.questions}問</Text>
                <Text style={styles.deadlineText}>期限: {quiz.deadline}</Text>
                {quiz.requiresAttestation && (
                  <Text style={styles.attestationText}>🔒 同意必須</Text>
                )}
              </View>
              
              <View style={styles.cardFooter}>
                {quiz.completed ? (
                  <Text style={styles.completedText}>✅ 完了</Text>
                ) : (
                  <Text style={styles.pendingText}>⏳ 未回答</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* クイズ詳細モーダル */}
      <Modal
        visible={isQuizModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeQuiz}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={closeQuiz}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isQuizActive ? 'クイズ中' : quizResults ? '結果' : 'クイズ詳細'}
            </Text>
          </View>
          
          {selectedQuiz && (
            <ScrollView style={styles.modalContent}>
              {!isQuizActive && !quizResults && (
                // クイズ詳細表示
                <View style={styles.quizDetailCard}>
                  <Text style={styles.quizDetailTitle}>{selectedQuiz.title}</Text>
                  <View style={styles.quizDetailInfo}>
                    <Text style={styles.quizDetailText}>問題数: {selectedQuiz.questions}問</Text>
                    <Text style={styles.quizDetailText}>出典: {selectedQuiz.source}</Text>
                    <Text style={styles.quizDetailText}>期限: {selectedQuiz.deadline}</Text>
                    {selectedQuiz.requiresAttestation && (
                      <Text style={styles.quizDetailText}>🔒 同意必須</Text>
                    )}
                  </View>
                  
                  {selectedQuiz.questionData && selectedQuiz.questionData.length > 0 ? (
                    <View style={styles.questionsPreview}>
                      <Text style={styles.questionsPreviewTitle}>質問プレビュー:</Text>
                      {selectedQuiz.questionData.slice(0, 3).map((question: any, index: number) => (
                        <View key={question.id} style={styles.questionPreviewItem}>
                          <Text style={styles.questionPreviewText}>
                            {index + 1}. {question.question_text}
                          </Text>
                          <Text style={styles.questionPreviewOptions}>
                            選択肢: {question.options?.length || 0}個
                          </Text>
                        </View>
                      ))}
                      {selectedQuiz.questionData.length > 3 && (
                        <Text style={styles.questionPreviewMore}>
                          他 {selectedQuiz.questionData.length - 3} 問...
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.noQuestionsWarning}>
                      <Text style={styles.noQuestionsText}>⚠️ 質問データがありません</Text>
                      <Text style={styles.noQuestionsSubText}>配信ビルダーで質問を作成してください</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.startQuizButton,
                      (!selectedQuiz.questionData || selectedQuiz.questionData.length === 0) && styles.disabledButton
                    ]}
                    onPress={startQuiz}
                    disabled={!selectedQuiz.questionData || selectedQuiz.questionData.length === 0}
                  >
                    <Text style={styles.startQuizButtonText}>クイズを開始</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isQuizActive && selectedQuiz.questionData && (
                // クイズ実行中
                <View style={styles.quizActiveCard}>
                  <View style={styles.quizProgress}>
                    <Text style={styles.quizProgressText}>
                      問題 {currentQuestionIndex + 1} / {selectedQuiz.questionData.length}
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${((currentQuestionIndex + 1) / selectedQuiz.questionData.length) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>

                  <View style={styles.currentQuestion}>
                    <Text style={styles.questionText}>
                      {selectedQuiz.questionData[currentQuestionIndex].question_text}
                    </Text>
                    
                    <View style={styles.optionsContainer}>
                      {selectedQuiz.questionData[currentQuestionIndex].options?.map((option: string, optionIndex: number) => (
                        <TouchableOpacity
                          key={optionIndex}
                          style={[
                            styles.optionButton,
                            selectedAnswers[selectedQuiz.questionData[currentQuestionIndex].id] === option && styles.selectedOption
                          ]}
                          onPress={() => selectAnswer(selectedQuiz.questionData[currentQuestionIndex].id, option)}
                        >
                          <Text style={[
                            styles.optionText,
                            selectedAnswers[selectedQuiz.questionData[currentQuestionIndex].id] === option && styles.selectedOptionText
                          ]}>
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.quizNavigation}>
                    {currentQuestionIndex > 0 && (
                      <TouchableOpacity
                        style={styles.navButton}
                        onPress={previousQuestion}
                      >
                        <Text style={styles.navButtonText}>← 前の問題</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={[
                        styles.navButton,
                        styles.primaryNavButton,
                        !selectedAnswers[selectedQuiz.questionData[currentQuestionIndex].id] && styles.disabledButton
                      ]}
                      onPress={nextQuestion}
                      disabled={!selectedAnswers[selectedQuiz.questionData[currentQuestionIndex].id]}
                    >
                      <Text style={styles.navButtonText}>
                        {currentQuestionIndex === selectedQuiz.questionData.length - 1 ? '結果を見る' : '次の問題 →'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {quizResults && (
                // クイズ結果表示
                <View style={styles.resultsCard}>
                  <Text style={styles.resultsTitle}>クイズ結果</Text>
                  
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{quizResults.score}点</Text>
                    <Text style={styles.scoreDetail}>
                      {quizResults.correctCount} / {quizResults.totalQuestions} 問正解
                    </Text>
                  </View>

                  <View style={styles.resultsList}>
                    <Text style={styles.resultsListTitle}>詳細結果:</Text>
                    {quizResults.results.map((result: any, index: number) => (
                      <View key={index} style={styles.resultItem}>
                        <Text style={styles.resultQuestionText}>
                          {index + 1}. {result.question}
                        </Text>
                        <View style={styles.resultAnswerInfo}>
                          <Text style={styles.resultAnswerText}>
                            あなたの回答: {result.selectedAnswer || '未回答'}
                          </Text>
                          <Text style={styles.resultAnswerText}>
                            正解: {result.correctAnswer}
                          </Text>
                          <Text style={[
                            styles.resultStatus,
                            result.isCorrect ? styles.correctStatus : styles.incorrectStatus
                          ]}>
                            {result.isCorrect ? '✅ 正解' : '❌ 不正解'}
                          </Text>
                        </View>
                        {result.explanation && (
                          <Text style={styles.resultExplanation}>
                            解説: {result.explanation}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>

                  <View style={styles.resultsActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={resetQuiz}
                    >
                      <Text style={styles.actionButtonText}>再挑戦</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryActionButton]}
                      onPress={closeQuiz}
                    >
                      <Text style={styles.actionButtonText}>完了</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4f46e5',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 5,
  },
  refreshButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    // タップ可能な領域を明確にする
    minHeight: 100,
  },
  completedCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  sourceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newsTag: {
    backgroundColor: '#dbeafe',
  },
  policyTag: {
    backgroundColor: '#dcfce7',
  },
  quizTag: {
    backgroundColor: '#e0e7ff',
  },
  manualTag: {
    backgroundColor: '#fed7aa',
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardBody: {
    marginBottom: 12,
  },
  questionsText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  deadlineText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  attestationText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  completedText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  pendingText: {
    fontSize: 14,
    color: '#d97706',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  // モーダル用スタイル
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#4f46e5',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  quizDetailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quizDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  quizDetailInfo: {
    marginBottom: 30,
  },
  quizDetailText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 10,
  },
  questionsPreview: {
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  questionsPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  questionPreviewItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  questionPreviewText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  questionPreviewOptions: {
    fontSize: 12,
    color: '#6b7280',
  },
  questionPreviewMore: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  noQuestionsWarning: {
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#92400e',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noQuestionsSubText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  startQuizButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  startQuizButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  // クイズ実行中スタイル
  quizActiveCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quizProgress: {
    marginBottom: 20,
  },
  quizProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 4,
  },
  currentQuestion: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  selectedOption: {
    borderColor: '#4f46e5',
    backgroundColor: '#e0e7ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  quizNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#6b7280',
    minWidth: 120,
    alignItems: 'center',
  },
  primaryNavButton: {
    backgroundColor: '#4f46e5',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // 結果表示スタイル
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 8,
  },
  scoreDetail: {
    fontSize: 18,
    color: '#6b7280',
  },
  resultsList: {
    marginBottom: 30,
  },
  resultsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  resultQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  resultAnswerInfo: {
    marginBottom: 8,
  },
  resultAnswerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  correctStatus: {
    color: '#059669',
  },
  incorrectStatus: {
    color: '#dc2626',
  },
  resultExplanation: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  resultsActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: '#6b7280',
    minWidth: 120,
    alignItems: 'center',
  },
  primaryActionButton: {
    backgroundColor: '#4f46e5',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
