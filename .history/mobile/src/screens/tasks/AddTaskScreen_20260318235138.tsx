import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Loading } from '../../components';
import { COLORS, TASK_CATEGORIES, TASK_PRIORITIES, REMINDER_OPTIONS } from '../../constants';
import { MainStackParamList, TaskCategory, TaskPriority } from '../../types';
import { tasksAPI } from '../../services/api';
import { scheduleTaskNotification } from '../../services/notifications';
import { formatDateForInput } from '../../utils/helpers';

type AddTaskNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AddTask'>;

interface AddTaskScreenProps {
  navigation: AddTaskNavigationProp;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
}

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>(formatDateForInput(new Date()));
  const [dueTime, setDueTime] = useState<string>('09:00');
  const [reminderMinutes, setReminderMinutes] = useState<number>(15);
  const [tags, setTags] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const categories = Object.entries(TASK_CATEGORIES);
  const priorities = Object.entries(TASK_PRIORITIES);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        dueDate: new Date(dueDate),
        dueTime,
        reminderMinutes,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      const response = await tasksAPI.create(taskData);
      
      if (response.success && response.data) {
        // Schedule notification
        await scheduleTaskNotification(response.data.task);
        
        Alert.alert(
          'Success',
          'Task created successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert('Error', err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Creating task..." />;
  }

  return (
    <SafeAreaView style={addTaskStyles.container}>
      <View style={addTaskStyles.header}>
        <TouchableOpacity
          style={addTaskStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={addTaskStyles.headerTitle}>Add New Task</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={addTaskStyles.scrollContent}
      >
        {/* Title */}
        <Input
          label="Task Title"
          value={title}
          onChangeText={setTitle}
          placeholder="What do you need to do?"
          error={errors.title}
          required
        />

        {/* Description */}
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Add more details..."
          multiline
          numberOfLines={3}
        />

        {/* Category Selection */}
        <View style={addTaskStyles.section}>
          <Text style={addTaskStyles.sectionLabel}>Category</Text>
          <View style={addTaskStyles.optionsGrid}>
            {categories.map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  addTaskStyles.optionChip,
                  category === key && { borderColor: value.color, backgroundColor: value.color + '15' },
                ]}
                onPress={() => setCategory(key as TaskCategory)}
              >
                <MaterialCommunityIcons
                  name={value.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={18}
                  color={category === key ? value.color : COLORS.textLight}
                />
                <Text style={[
                  addTaskStyles.optionText,
                  category === key && { color: value.color },
                ]}>
                  {value.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Selection */}
        <View style={addTaskStyles.section}>
          <Text style={addTaskStyles.sectionLabel}>Priority</Text>
          <View style={addTaskStyles.optionsRow}>
            {priorities.map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  addTaskStyles.priorityChip,
                  priority === key && { borderColor: value.color, backgroundColor: value.color + '15' },
                ]}
                onPress={() => setPriority(key as TaskPriority)}
              >
                <Text style={[
                  addTaskStyles.priorityText,
                  priority === key && { color: value.color },
                ]}>
                  {value.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date & Time */}
        <View style={addTaskStyles.section}>
          <Text style={addTaskStyles.sectionLabel}>Due Date & Time</Text>
          <View style={addTaskStyles.dateTimeRow}>
            <TouchableOpacity style={addTaskStyles.dateTimePicker}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={addTaskStyles.dateTimeText}>{dueDate}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={addTaskStyles.dateTimePicker}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={addTaskStyles.dateTimeText}>{dueTime}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminder */}
        <View style={addTaskStyles.section}>
          <Text style={addTaskStyles.sectionLabel}>Reminder</Text>
          <View style={addTaskStyles.reminderOptions}>
            {REMINDER_OPTIONS.slice(0, 4).map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  addTaskStyles.reminderChip,
                  reminderMinutes === option.value && addTaskStyles.reminderChipActive,
                ]}
                onPress={() => setReminderMinutes(option.value)}
              >
                <Text style={[
                  addTaskStyles.reminderText,
                  reminderMinutes === option.value && addTaskStyles.reminderTextActive,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        <Input
          label="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
          placeholder="e.g., urgent, study, exam"
          helperText="Add tags to organize your tasks"
        />

        {/* Submit Button */}
        <View style={addTaskStyles.submitContainer}>
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

const addTaskStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  } as TextStyle,
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  } as ViewStyle,
  section: {
    marginBottom: 20,
  } as ViewStyle,
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  } as TextStyle,
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  } as ViewStyle,
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  } as ViewStyle,
  optionText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 6,
  } as TextStyle,
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  } as ViewStyle,
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  } as ViewStyle,
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  } as TextStyle,
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,
  dateTimePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  } as ViewStyle,
  dateTimeText: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
  } as TextStyle,
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  } as ViewStyle,
  reminderChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  } as ViewStyle,
  reminderChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  } as ViewStyle,
  reminderText: {
    fontSize: 13,
    color: COLORS.textLight,
  } as TextStyle,
  reminderTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  } as TextStyle,
  submitContainer: {
    marginTop: 24,
  } as ViewStyle,
});

export default AddTaskScreen;
