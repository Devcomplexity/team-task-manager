const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;
    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project required' });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ message: 'Project not found' });

    const isAuthorized =
      projectDoc.owner.toString() === req.user._id.toString() ||
      projectDoc.members.some((m) => m.toString() === req.user._id.toString()) ||
      req.user.role === 'Admin';

    if (!isAuthorized) return res.status(403).json({ message: 'Access denied' });

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,
      priority,
      dueDate,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks (all for user / by project)
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let filter = {};

    if (projectId) {
      filter.project = projectId;
    } else if (req.user.role !== 'Admin') {
      // Get tasks from projects user is part of
      const projects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');
      filter.project = { $in: projects.map((p) => p._id) };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort('-createdAt');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = task.project;
    const isAuthorized =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.toString() === req.user._id.toString()) ||
      req.user.role === 'Admin';

    if (!isAuthorized) return res.status(403).json({ message: 'Access denied' });

    const { title, description, status, assignedTo, priority, dueDate } = req.body;
    task.title = title || task.title;
    task.description = description ?? task.description;
    task.status = status || task.status;
    task.assignedTo = assignedTo ?? task.assignedTo;
    task.priority = priority || task.priority;
    task.dueDate = dueDate ?? task.dueDate;

    const updated = await task.save();
    const populated = await Task.findById(updated._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAuthorized =
      task.project.owner.toString() === req.user._id.toString() ||
      task.createdBy.toString() === req.user._id.toString() ||
      req.user.role === 'Admin';

    if (!isAuthorized) return res.status(403).json({ message: 'Access denied' });

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dashboard stats
// @route   GET /api/tasks/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    let projectFilter = {};
    if (req.user.role !== 'Admin') {
      const projects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');
      projectFilter = { project: { $in: projects.map((p) => p._id) } };
    }

    const total = await Task.countDocuments(projectFilter);
    const todo = await Task.countDocuments({ ...projectFilter, status: 'Todo' });
    const inProgress = await Task.countDocuments({ ...projectFilter, status: 'In Progress' });
    const done = await Task.countDocuments({ ...projectFilter, status: 'Done' });
    const overdue = await Task.countDocuments({
      ...projectFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' },
    });
    const myTasks = await Task.countDocuments({
      ...projectFilter,
      assignedTo: req.user._id,
    });

    res.json({ total, todo, inProgress, done, overdue, myTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};