import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TaskCard, Button, Loading } from '../../components';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI } from '../../services/api';
import { Task, TaskStatsResponse, MainStackParamList, TabParamList, TaskStatus } from '../../types';
import { formatDate, isToday } from '../../utils/helpers';

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Dashboard'>,
  NativeStackNavigationProp<MainStackParamList>
>;

interface DashboardScreenProps {
  navigation: DashboardNavigationProp;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const { user, logout } = useAuth();

  const fetchData = async (): Promise<void> => {
    try {
      const [todayRes, statsRes] = await Promise.all([
        tasksAPI.getToday(),
        tasksAPI.getStats(),
      ]);

      if (todayRes.success && todayRes.data) {
        setTodayTasks(todayRes.data.tasks);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
    try {
      const response = await tasksAPI.updateStatus(taskId, newStatus);
      if (response.success) {
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleTaskPress = (task: Task): void => {
    navigation.navigate('TaskDetail', { task });
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen message="Loading your tasks..." />;
  }

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={dashboardStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={dashboardStyles.header}>
          <View style={dashboardStyles.headerTop}>
            <View>
              <Text style={dashboardStyles.greeting}>{getGreeting()},</Text>
              <Text style={dashboardStyles.userName}>{user?.name || 'Student'}</Text>
            </View>
            <TouchableOpacity
              style={dashboardStyles.profileButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={dashboardStyles.statsContainer}>
          <View style={[dashboardStyles.statCard, dashboardStyles.primaryCard]}>
            <View style={dashboardStyles.statIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
            </View>
            <Text style={dashboardStyles.statNumber}>{stats.completionRate}%</Text>
            <Text style={dashboardStyles.statLabel}>Completion Rate</Text>
          </View>

          <View style={dashboardStyles.statsRow}>
            <View style={dashboardStyles.statCardSmall}>
              <Text style={dashboardStyles.statNumberSmall}>{stats.pending}</Text>
              <Text style={dashboardStyles.statLabelSmall}>Pending</Text>
            </View>
            <View style={[dashboardStyles.statCardSmall, dashboardStyles.overdueCard]}>
              <Text style={[dashboardStyles.statNumberSmall, dashboardStyles.overdueNumber]}>{stats.overdue}</Text>
              <Text style={[dashboardStyles.statLabelSmall, dashboardStyles.overdueLabel]}>Overdue</Text>
            </View>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={dashboardStyles.section}>
          <View style={dashboardStyles.sectionHeader}>
            <View style={dashboardStyles.sectionTitleRow}>
              <Ionicons name="today" size={22} color={COLORS.primary} />
              <Text style={dashboardStyles.sectionTitle}>Today's Tasks</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AllTasks')}>
              <Text style={dashboardStyles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {todayTasks.length === 0 ? (
            <View style={dashboardStyles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={64} color={COLORS.border} />
              <Text style={dashboardStyles.emptyTitle}>No tasks for today!</Text>
              <Text style={dashboardStyles.emptySubtitle}>
                Enjoy your free time or add a new task
              </Text>
              <Button
                title="Add Task"
                onPress={() => navigation.navigate('AddTask')}
                size="small"
                style={dashboardStyles.addButton}
              />
            </View>
          ) : (
            todayTasks.slice(0, 5).map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onPress={handleTaskPress}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={dashboardStyles.section}>
          <Text style={dashboardStyles.sectionTitle}>Quick Actions</Text>
          <View style={dashboardStyles.quickActions}>
            <TouchableOpacity
              style={dashboardStyles.quickActionCard}
              onPress={() => navigation.navigate('AddTask')}
            >
              <View style={[dashboardStyles.quickActionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="add" size={24} color={COLORS.primary} />
              </View>
              <Text style={dashboardStyles.quickActionText}>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={dashboardStyles.quickActionCard}
              onPress={() => navigation.navigate('WeeklySchedule')}
            >
              <View style={[dashboardStyles.quickActionIcon, { backgroundColor: COLORS.accent + '15' }]}>
                <Ionicons name="calendar" size={24} color={COLORS.accent} />
              </View>
              <Text style={dashboardStyles.quickActionText}>Weekly View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={dashboardStyles.quickActionCard}
              onPress={() => navigation.navigate('AllTasks')}
            >
              <View style={[dashboardStyles.quickActionIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                <Ionicons name="list" size={24} color={COLORS.secondary} />
              </View>
              <Text style={dashboardStyles.quickActionText}>All Tasks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={dashboardStyles.fab}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  } as ViewStyle,
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  greeting: {
    fontSize: 14,
    color: COLORS.textLight,
  } as TextStyle,
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  } as TextStyle,
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  } as ViewStyle,
  statCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  } as ViewStyle,
  primaryCard: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  } as ViewStyle,
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  } as ViewStyle,
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
  } as TextStyle,
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  } as TextStyle,
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,
  statCardSmall: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  } as ViewStyle,
  statNumberSmall: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  } as TextStyle,
  statLabelSmall: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  } as TextStyle,
  overdueCard: {
    backgroundColor: '#FFF5F5',
  } as ViewStyle,
  overdueNumber: {
    color: COLORS.error,
  } as TextStyle,
  overdueLabel: {
    color: COLORS.error,
  } as TextStyle,
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  } as ViewStyle,
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  } as TextStyle,
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  } as TextStyle,
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  } as ViewStyle,
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  } as TextStyle,
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
    marginBottom: 20,
  } as TextStyle,
  addButton: {
    paddingHorizontal: 24,
  } as ViewStyle,
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  } as ViewStyle,
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  } as ViewStyle,
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  } as TextStyle,
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  } as ViewStyle,
});

export default DashboardScreen;