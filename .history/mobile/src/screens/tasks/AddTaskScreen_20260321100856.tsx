//mobile/src/screens/tasks/AddTas
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Loading } from '../../components';
import { COLORS, TASK_CATEGORIES, TASK_PRIORITIES, REMINDER_OPTIONS } from '../../constants';
import { MainStackParamList, TaskCategory, TaskPriority } from '../../types';
import { tasksAPI } from '../../services/api';
import { scheduleTaskNotification } from '../../services/notifications';

type AddTaskNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AddTask'>;

interface AddTaskScreenProps {
  navigation: AddTaskNavigationProp;
}

interface FormErrors {
  title?: string;
  dueDateTime?: string;
}

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  const defaultDue = new Date();
  defaultDue.setHours(9, 0, 0, 0);

  const [dueDateTime, setDueDateTime] = useState<Date>(defaultDue);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const categories = Object.entries(TASK_CATEGORIES);
  const priorities = Object.entries(TASK_PRIORITIES);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (dueDateTime < new Date()) {
      newErrors.dueDateTime = 'Due date/time must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        dueDate: dueDateTime.toISOString(),
        reminderMinutes,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      const response = await tasksAPI.create(taskData);

      if (response.success && response.data) {
        await scheduleTaskNotification(response.data.task);

        Alert.alert('Success', 'Task created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDateTime;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDateTime(currentDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || dueDateTime;
    setShowTimePicker(Platform.OS === 'ios');
    setDueDateTime(currentTime);
  };

  if (loading) {
    return <Loading fullScreen message="Creating task..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Task</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input
          label="Task Title"
          value={title}
          onChangeText={setTitle}
          placeholder="What do you need to do?"
          error={errors.title}
          required
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Add more details..."
          multiline
          numberOfLines={3}
        />

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.optionsGrid}>
            {categories.map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.optionChip,
                  category === key && { borderColor: value.color, backgroundColor: `${value.color}15` },
                ]}
                onPress={() => setCategory(key as TaskCategory)}
              >
                <MaterialCommunityIcons
                  name={value.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={18}
                  color={category === key ? value.color : COLORS.textLight}
                />
                <Text
                  style={[
                    styles.optionText,
                    category === key && { color: value.color },
                  ]}
                >
                  {value.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Priority</Text>
          <View style={styles.optionsRow}>
            {priorities.map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.priorityChip,
                  priority === key && { borderColor: value.color, backgroundColor: `${value.color}15` },
                ]}
                onPress={() => setPriority(key as TaskPriority)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === key && { color: value.color },
                  ]}
                >
                  {value.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Due Date & Time</Text>

          {errors.dueDateTime && (
            <Text style={styles.errorText}>{errors.dueDateTime}</Text>
          )}

          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[
                styles.dateTimePicker,
                errors.dueDateTime && styles.inputError,
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateTimeText}>{formatDate(dueDateTime)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateTimePicker,
                errors.dueDateTime && styles.inputError,
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateTimeText}>{formatTime(dueDateTime)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDateTime}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dueDateTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Reminder */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reminder</Text>
          <View style={styles.reminderOptions}>
            {REMINDER_OPTIONS.slice(0, 4).map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.reminderChip,
                  reminderMinutes === option.value && styles.reminderChipActive,
                ]}
                onPress={() => setReminderMinutes(option.value)}
              >
                <Text
                  style={[
                    styles.reminderText,
                    reminderMinutes === option.value && styles.reminderTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input
          label="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
          placeholder="e.g., urgent, study, exam"
          helperText="Add tags to organize your tasks"
        />

        <View style={styles.submitContainer}>
          <Button
            title="Create Task"
            onPress={handleSubmit}
            fullWidth
            size="large"
            loading={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  dateTimeText: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
  inputError: {
    borderColor: COLORS.error || '#ff3b30',
  },
  errorText: {
    color: COLORS.error || '#ff3b30',
    fontSize: 12,
    marginBottom: 8,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reminderChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  reminderChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
  },
  reminderText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  reminderTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  submitContainer: {
    marginTop: 28,
  },
});

export default AddTaskScreen;