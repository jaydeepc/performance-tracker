const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { username, password } = req.body;

        // Validate request
        if (!username || !password) {
            console.log('Missing credentials');
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Please provide username and password',
                    details: ['Username and password are required']
                }
            });
        }

        // Check for user
        const user = await User.findOne({ username });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user || !(await user.matchPassword(password))) {
            console.log('Invalid credentials');
            return res.status(401).json({
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid credentials',
                    details: ['Username or password is incorrect']
                }
            });
        }

        // Create token
        const token = generateToken(user._id);
        console.log('Token generated');

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error logging in',
                details: [error.message]
            }
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    try {
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Error logging out',
                details: [error.message]
            }
        });
    }
};

module.exports = {
    login,
    logout
};
