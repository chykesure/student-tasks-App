import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from '../constants';
import { TaskCardProps, Task, TaskStatus, TaskCategoryConfig, TaskPriorityConfig, TaskStatusConfig } from '../types';
import { formatDate, formatTime, isOverdue, isToday, isTomorrow } from '../utils/helpers';

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onStatusChange }) => {
  const category = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.other as TaskCategoryConfig;
  const priority = TASK_PRIORITIES[task.priority] || TASK_PRIORITIES.medium as TaskPriorityConfig;
  const status = TASK_STATUSES[task.status] || TASK_STATUSES.pending as TaskStatusConfig;
  const overdue = isOverdue(task.dueDate, task.status);

  const getDateDisplay = (): string => {
    const date = new Date(task.dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return formatDate(date, 'short');
  };

  const handleComplete = (): void => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    onStatusChange?.(task._id, newStatus);
  };

  return (
    <TouchableOpacity
      style={[
        cardStyles.container,
        overdue && cardStyles.overdueContainer,
        task.status === 'completed' && cardStyles.completedContainer,
      ]}
      onPress={() => onPress?.(task)}
      activeOpacity={0.7}
    >
      <View style={cardStyles.header}>
        <View style={[cardStyles.categoryBadge, { backgroundColor: category.color + '20' }]}>
          <MaterialCommunityIcons
            name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={14}
            color={category.color}
          />
          <Text style={[cardStyles.categoryText, { color: category.color }]}>
            {category.label}
          </Text>
        </View>
        
        <View style={[cardStyles.priorityBadge, { backgroundColor: priority.color + '20' }]}>
          <Text style={[cardStyles.priorityText, { color: priority.color }]}>
            {priority.label}
          </Text>
        </View>
      </View>

      <View style={cardStyles.content}>
        <TouchableOpacity
          style={[
            cardStyles.checkbox,
            task.status === 'completed' && cardStyles.checkboxCompleted,
          ]}
          onPress={handleComplete}
        >
          {task.status === 'completed' && (
            <Ionicons name="checkmark" size={16} color={COLORS.white} />
          )}
        </TouchableOpacity>

        <View style={cardStyles.textContainer}>
          <Text
            style={[
              cardStyles.title,
              task.status === 'completed' && cardStyles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          
          {task.description ? (
            <Text style={cardStyles.description} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={cardStyles.footer}>
        <View style={cardStyles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color={overdue ? COLORS.error : COLORS.textLight} />
          <Text style={[cardStyles.dateText, overdue && cardStyles.overdueText]}>
            {getDateDisplay()}
          </Text>
          
          {task.dueTime && (
            <>
              <Ionicons name="time-outline" size={14} color={overdue ? COLORS.error : COLORS.textLight} style={cardStyles.timeIcon} />
              <Text style={[cardStyles.dateText, overdue && cardStyles.overdueText]}>
                {formatTime(task.dueTime)}
              </Text>
            </>
          )}
        </View>

        <View style={[cardStyles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Text style={[cardStyles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {task.tags && task.tags.length > 0 && (
        <View style={cardStyles.tagsContainer}>
          {task.tags.slice(0, 3).map((tag: string, index: number) => (
            <View key={index} style={cardStyles.tag}>
              <Text style={cardStyles.tagText}>#{tag}</Text>
            </View>
          ))}
          {task.tags.length > 3 && (
            <Text style={cardStyles.moreTags}>+{task.tags.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  } as ViewStyle,
  overdueContainer: {
    borderLeftColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  } as ViewStyle,
  completedContainer: {
    opacity: 0.7,
    borderLeftColor: COLORS.success,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  } as ViewStyle,
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  } as TextStyle,
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  } as ViewStyle,
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  } as ViewStyle,
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  } as ViewStyle,
  textContainer: {
    flex: 1,
  } as ViewStyle,
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  } as TextStyle,
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  } as TextStyle,
  description: {
    fontSize: 14,
    color: COLORS.textLight,
  } as TextStyle,
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  dateText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 4,
  } as TextStyle,
  timeIcon: {
    marginLeft: 12,
  } as ViewStyle,
  overdueText: {
    color: COLORS.error,
    fontWeight: '500',
  } as TextStyle,
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  } as ViewStyle,
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  } as ViewStyle,
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  } as ViewStyle,
  tagText: {
    fontSize: 12,
    color: COLORS.textLight,
  } as TextStyle,
  moreTags: {
    fontSize: 12,
    color: COLORS.textLight,
    alignSelf: 'center',
  } as TextStyle,
});

export default TaskCard;
