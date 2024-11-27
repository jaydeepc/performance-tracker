const User = require('../models/User');
const Evaluation = require('../models/Evaluation');

// Helper function to check if evaluation exists for current month
const hasCurrentMonthEvaluation = async (userId) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const evaluation = await Evaluation.findOne({
        userId,
        createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    });

    return evaluation ? evaluation._id : null;
};

const getReportees = async (req, res) => {
    try {
        const reportees = await User.find({ managerId: req.params.managerId });
        
        // Get evaluation status for each reportee
        const reporteesWithStatus = await Promise.all(reportees.map(async (reportee) => {
            const evaluationId = await hasCurrentMonthEvaluation(reportee._id);
            return {
                id: reportee._id,
                name: reportee.name,
                email: reportee.email,
                department: reportee.department,
                currentMonthEvaluationId: evaluationId,
                evaluationStatus: evaluationId ? 'completed' : 'pending'
            };
        }));

        res.json(reporteesWithStatus);
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching reportees',
                details: [error.message]
            }
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, role, name, email, managerId, department } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({
                error: {
                    code: 'USER_EXISTS',
                    message: 'User already exists',
                    details: ['Username or email is already taken']
                }
            });
        }

        // Create user
        const user = await User.create({
            username,
            password,
            role,
            name,
            email,
            managerId,
            department
        });

        res.status(201).json({
            id: user._id,
            username: user.username,
            role: user.role,
            name: user.name,
            email: user.email,
            managerId: user.managerId,
            department: user.department
        });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error creating user',
                details: [error.message]
            }
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users.map(user => ({
            id: user._id,
            username: user.username,
            role: user.role,
            name: user.name,
            email: user.email,
            managerId: user.managerId,
            department: user.department
        })));
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching users',
                details: [error.message]
            }
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'User not found',
                    details: ['No user found with this ID']
                }
            });
        }
        res.json({
            id: user._id,
            username: user.username,
            role: user.role,
            name: user.name,
            email: user.email,
            managerId: user.managerId,
            department: user.department
        });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching user',
                details: [error.message]
            }
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { username, role, name, email, managerId, department } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'User not found',
                    details: ['No user found with this ID']
                }
            });
        }

        // Check if new email/username is already taken by another user
        if (username || email) {
            const existingUser = await User.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    { username: username || user.username },
                    { email: email || user.email }
                ]
            });
            if (existingUser) {
                return res.status(400).json({
                    error: {
                        code: 'USER_EXISTS',
                        message: 'Username or email already taken',
                        details: ['Please choose a different username or email']
                    }
                });
            }
        }

        user.username = username || user.username;
        user.role = role || user.role;
        user.name = name || user.name;
        user.email = email || user.email;
        user.managerId = managerId || user.managerId;
        user.department = department || user.department;

        await user.save();

        res.json({
            id: user._id,
            username: user.username,
            role: user.role,
            name: user.name,
            email: user.email,
            managerId: user.managerId,
            department: user.department
        });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating user',
                details: [error.message]
            }
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'User not found',
                    details: ['No user found with this ID']
                }
            });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error deleting user',
                details: [error.message]
            }
        });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    getReportees,
    updateUser,
    deleteUser
};
