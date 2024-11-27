import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { users } from '../../services/api';
import { User } from '../../types';

interface UserFormData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'reportee';
  managerId: string;
  department: string;
}

const initialFormData: UserFormData = {
  username: '',
  password: '',
  name: '',
  email: '',
  role: 'reportee',
  managerId: '',
  department: '',
};

const Users = () => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [managers, setManagers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await users.getAll();
      const allUsers = response.data as User[];
      setUsersList(allUsers);
      setManagers(allUsers.filter(user => user.role === 'manager'));
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setFormData({
        username: user.username,
        password: '', // Don't show existing password
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId || '',
        department: user.department || '',
      });
      setEditingUserId(user.id);
    } else {
      setFormData(initialFormData);
      setEditingUserId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setEditingUserId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await users.update(editingUserId, formData);
      } else {
        await users.create(formData);
      }
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      setError('Failed to save user');
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await users.delete(userId);
        fetchUsers();
      } catch (error) {
        setError('Failed to delete user');
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Users Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersList.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.department || '-'}</TableCell>
                <TableCell>
                  {user.managerId
                    ? managers.find((m) => m.id === user.managerId)?.name || '-'
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingUserId ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingUserId}
                helperText={
                  editingUserId
                    ? 'Leave blank to keep existing password'
                    : 'Enter password'
                }
              />
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <TextField
                select
                label="Role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'admin' | 'manager' | 'reportee',
                  })
                }
                required
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="reportee">Reportee</MenuItem>
              </TextField>
              <TextField
                select
                label="Manager"
                value={formData.managerId}
                onChange={(e) =>
                  setFormData({ ...formData, managerId: e.target.value })
                }
                disabled={formData.role !== 'reportee'}
              >
                <MenuItem value="">None</MenuItem>
                {managers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingUserId ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Users;
