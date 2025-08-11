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
        created_at: quiz.created_at
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
        onRequestClose={() => setIsQuizModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsQuizModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>クイズ詳細</Text>
          </View>
          
          {selectedQuiz && (
            <ScrollView style={styles.modalContent}>
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
                
                <TouchableOpacity
                  style={styles.startQuizButton}
                  onPress={() => {
                    console.log('クイズ開始:', selectedQuiz.id);
                    Alert.alert('クイズ開始', 'この機能は現在開発中です。');
                    setIsQuizModalVisible(false);
                  }}
                >
                  <Text style={styles.startQuizButtonText}>クイズを開始</Text>
                </TouchableOpacity>
              </View>
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
});
