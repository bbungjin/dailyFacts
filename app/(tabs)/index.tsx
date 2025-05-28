import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DailyFact } from '@/types/DailyFact';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  const [todaysFact, setTodaysFact] = useState<DailyFact | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // GitHub에서 데이터 가져오기
  const fetchDailyFacts = async () => {
    try {
      // 실제 GitHub raw JSON URL로 변경
      // YOUR_USERNAME을 실제 GitHub 사용자명으로, YOUR_REPO를 리포지토리명으로 바꿔주세요
      const response = await fetch('https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/daily-facts.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const fact = data.facts.find((fact: DailyFact) => fact.date === today);
      
      setTodaysFact(fact || null);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
      
      // 개발 중에는 테스트용 데이터 사용
      if (__DEV__) {
        setTodaysFact({
          date: new Date().toISOString().split('T')[0],
          title: "테스트 사실",
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
          content: "GitHub JSON 파일을 설정한 후 실제 데이터가 표시됩니다."
        });
      } else {
        Alert.alert('오류', '데이터를 불러올 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDailyFacts();
    setRefreshing(false);
  }, []);

  // 알림 권한 요청
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('알림 권한', '일일 알림을 받으려면 알림 권한이 필요합니다.');
    }
  };

  // 일일 알림 스케줄링
  const scheduleDailyNotification = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '오늘의 흥미로운 사실! 🌟',
        body: '새로운 사실을 확인해보세요!',
        data: { type: 'daily-fact' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  };

  useEffect(() => {
    fetchDailyFacts();
    requestNotificationPermissions();
    scheduleDailyNotification();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>로딩 중...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            오늘의 흥미로운 사실
          </ThemedText>
          <ThemedText style={styles.date}>
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </ThemedText>
        </ThemedView>

        {todaysFact ? (
          <ThemedView style={styles.factContainer}>
            {todaysFact.image && (
              <Image
                source={{ uri: todaysFact.image }}
                style={styles.factImage}
                contentFit="cover"
              />
            )}
            
            {todaysFact.title && (
              <ThemedText type="subtitle" style={styles.factTitle}>
                {todaysFact.title}
              </ThemedText>
            )}
            
            <ThemedText style={styles.factContent}>
              {todaysFact.content}
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.noFactContainer}>
            <ThemedText style={styles.noFactText}>
              오늘의 사실이 아직 준비되지 않았습니다.
            </ThemedText>
            <ThemedText style={styles.noFactSubtext}>
              조금 후에 다시 확인해주세요!
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  factContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  factImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  factTitle: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#007AFF',
  },
  factContent: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'justify',
  },
  noFactContainer: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },
  noFactText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  noFactSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
