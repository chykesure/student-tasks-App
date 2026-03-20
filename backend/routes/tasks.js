const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get all tasks for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, priority, startDate, endDate, sort } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    // Build sort options
    let sortOptions = { dueDate: 1 }; // Default: sort by due date ascending
    if (sort === 'priority') {
      sortOptions = { priority: -1, dueDate: 1 }; // High priority first
    } else if (sort === 'created') {
      sortOptions = { createdAt: -1 }; // Newest first
    } else if (sort === 'status') {
      sortOptions = { status: 1, dueDate: 1 };
    }

    const tasks = await Task.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: tasks.length,
      data: {
        tasks: tasks.map(task => task.toPublicJSON())
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   GET /api/tasks/today
// @desc    Get tasks due today
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ dueTime: 1 });

    res.json({
      success: true,
      count: tasks.length,
      data: {
        tasks: tasks.map(task => task.toPublicJSON())
      }
    });
  } catch (error) {
    console.error('Get today tasks error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   GET /api/tasks/week
// @desc    Get tasks for current week
// @access  Private
router.get('/week', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $gte: startOfWeek, $lte: endOfWeek }
    }).sort({ dueDate: 1, dueTime: 1 });

    // Group tasks by day
    const tasksByDay = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayName = dayNames[date.getDay()];
      tasksByDay[dayName] = {
        date: date.toISOString().split('T')[0],
        tasks: []
      };
    }

    tasks.forEach(task => {
      const taskDate = new Date(task.dueDate);
      const dayName = dayNames[taskDate.getDay()];
      if (tasksByDay[dayName]) {
        tasksByDay[dayName].tasks.push(task.toPublicJSON());
      }
    });

    res.json({
      success: true,
      count: tasks.length,
      data: {
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
        tasksByDay
      }
    });
  } catch (error) {
    console.error('Get week tasks error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTasks = await Task.countDocuments({ user: req.user._id });
    const completedTasks = await Task.countDocuments({ 
      user: req.user._id, 
      status: 'completed' 
    });
    const pendingTasks = await Task.countDocuments({ 
      user: req.user._id, 
      status: 'pending' 
    });
    const overdueTasks = await Task.countDocuments({
      user: req.user._id,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        completionRate: totalTasks > 0 
          ? Math.round((completedTasks / totalTasks) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: {
        task: task.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Get task error:', error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post(
  '/',
  protect,
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('dueDate')
      .isISO8601()
      .withMessage('Please provide a valid due date'),
    body('category')
      .optional()
      .isIn(['study', 'assignment', 'exam', 'project', 'meeting', 'other'])
      .withMessage('Invalid category'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('reminderMinutes')
      .optional()
      .isInt({ min: 0, max: 1440 })
      .withMessage('Reminder must be between 0 and 1440 minutes')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        title,
        description,
        category,
        priority,
        dueDate,
        dueTime,
        reminderMinutes,
        isRecurring,
        recurringPattern,
        tags
      } = req.body;

      const task = await Task.create({
        user: req.user._id,
        title,
        description: description || '',
        category: category || 'other',
        priority: priority || 'medium',
        dueDate: new Date(dueDate),
        dueTime: dueTime || '',
        reminderMinutes: reminderMinutes || 15,
        isRecurring: isRecurring || false,
        recurringPattern: recurringPattern || '',
        tags: tags || []
      });

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: {
          task: task.toPublicJSON()
        }
      });
    } catch (error) {
      console.error('Create task error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while creating task'
      });
    }
  }
);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put(
  '/:id',
  protect,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid due date'),
    body('category')
      .optional()
      .isIn(['study', 'assignment', 'exam', 'project', 'meeting', 'other'])
      .withMessage('Invalid category'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      let task = await Task.findOne({
        _id: req.params.id,
        user: req.user._id
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Update fields
      const updateFields = [
        'title', 'description', 'category', 'priority', 
        'status', 'dueDate', 'dueTime', 'reminderMinutes',
        'isRecurring', 'recurringPattern', 'tags'
      ];

      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === 'dueDate') {
            task[field] = new Date(req.body[field]);
          } else {
            task[field] = req.body[field];
          }
        }
      });

      await task.save();

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: {
          task: task.toPublicJSON()
        }
      });
    } catch (error) {
      console.error('Update task error:', error.message);
      
      if (error.kind === 'ObjectId') {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error while updating task'
      });
    }
  }
);

// @route   PATCH /api/tasks/:id/status
// @desc    Update task status only
// @access  Private
router.patch(
  '/:id/status',
  protect,
  [
    body('status')
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const task = await Task.findOne({
        _id: req.params.id,
        user: req.user._id
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      task.status = req.body.status;
      await task.save();

      res.json({
        success: true,
        message: 'Task status updated',
        data: {
          task: task.toPublicJSON()
        }
      });
    } catch (error) {
      console.error('Update status error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while updating status'
      });
    }
  }
);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
});

module.exports = router;
