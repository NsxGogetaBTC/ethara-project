const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, admin } = require('../middleware/auth');

// Get tasks for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    let query = { project: req.params.projectId };
    if (req.user.role !== 'Admin') {
      query.assignee = req.user._id;
    }
    const tasks = await Task.find(query).populate('assignee', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user tasks (Dashboard)
router.get('/my-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id }).populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task (Admin only)
router.post('/', protect, admin, async (req, res) => {
  const { title, description, project, assignee, dueDate } = req.body;
  try {
    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      dueDate
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task status
router.put('/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
