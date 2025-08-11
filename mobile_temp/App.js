import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';

// Mock data for development
const mockQuizzes = [
  {
    id: '1',
    title: '教育デジタル化推進法について',
    source: 'News',
    deadline: '2025-08-15',
    questions: 3,
    completed: false
  },
  {
    id: '2', 
    title: '情報セキュリティ基本方針 v2.0',
    source: 'Policy',
    deadline: '2025-08-20',
    questions: 5,
    completed: false,
    requiresAttestation: true
  },
  {
    id: '3',
    title: 'リモートワーク FAQ',
    source: 'Manual', 
    deadline: '2025-08-25',
    questions: 4,
    completed: true
  }
];

export default function App() {
  const [quizzes, setQuizzes] = useState(mockQuizzes);

  const handleQuizPress = (quiz) => {
    Alert.alert(
      quiz.title,
      `${quiz.questions}問のクイズです。\n出典: ${quiz.source}\n期限: ${quiz.deadline}`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '開始', onPress: () => console.log('Quiz started:', quiz.id) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>OrgShift Quiz</Text>
        <Text style={styles.subtitle}>組織の理解を深めるクイズ</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>新着クイズ</Text>
        
        {quizzes.map((quiz) => (
          <TouchableOpacity
            key={quiz.id}
            style={[
              styles.quizCard,
              quiz.completed && styles.completedCard
            ]}
            onPress={() => handleQuizPress(quiz)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.quizTitle} numberOfLines={2}>
                {quiz.title}
              </Text>
              <View style={[
                styles.sourceTag,
                quiz.source === 'News' && styles.newsTag,
                quiz.source === 'Policy' && styles.policyTag,
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
        ))}
      </ScrollView>
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
});