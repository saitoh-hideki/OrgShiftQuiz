import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';

export default function App() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://192.168.1.10:3006/api/quizzes?status=active');
      const data = await response.json();
      
      if (data.success) {
        setQuizzes(data.quizzes);
      }
    } catch (error) {
      console.error('クイズ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleQuizPress = (quiz) => {
    Alert.alert(
      quiz.title,
      `${quiz.question_count}問のクイズです。\n期限: ${quiz.deadline}`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '開始', onPress: () => console.log('Quiz started:', quiz.id) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>新着クイズ</Text>
        <TouchableOpacity onPress={fetchQuizzes} style={styles.refreshButton}>
          <Text style={styles.refreshText}>更新</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {isLoading ? (
          <Text style={styles.loadingText}>読み込み中...</Text>
        ) : quizzes.length === 0 ? (
          <Text style={styles.emptyText}>新着クイズはありません</Text>
        ) : (
          quizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz.id}
              style={styles.quizItem}
              onPress={() => handleQuizPress(quiz)}
            >
              <Text style={styles.quizTitle}>{quiz.title}</Text>
              <Text style={styles.quizInfo}>
                {quiz.question_count}問 • 期限: {quiz.deadline}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  quizItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quizInfo: {
    fontSize: 14,
    color: '#666',
  },
});
