import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api, User } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, UserMinus, Trash2, Shield, ShieldOff, Users, UserCheck, UserX } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type UserRole = 'ROLE_ADMIN' | 'ROLE_TEACHER' | 'ROLE_STUDENT';
type UserStatus = 'ACTIVE' | 'INACTIVE';

const AdminPanelPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [userCount, setUserCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("ROLE_STUDENT");
  const [teacherEmail, setTeacherEmail] = useState("");

  const roles: string[] = (user as any)?.roles || [];

  // Check authentication and admin role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    if (!roles.includes('ROLE_ADMIN')) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, roles, navigate]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && roles.includes('ROLE_ADMIN')) {
      loadUsers();
      loadUserCount();
    }
  }, [isAuthenticated, roles]);

  // Filter users based on search term and role
  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== "ALL") {
      filtered = filtered.filter(u => 
        u.roles?.includes(selectedRole as "ROLE_USER" | "ROLE_STUDENT" | "ROLE_TEACHER" | "ROLE_ADMIN") || u.role === selectedRole
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await api.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserCount = async () => {
    try {
      const countData = await api.getUsersCount();
      setUserCount(countData.count);
    } catch (error) {
      console.error('Failed to load user count:', error);
    }
  };

  const handleAddRole = async (userId: string, role: UserRole) => {
    try {
      await api.assignUserRole(userId, role);
      await loadUsers();
      toast({
        title: "Success",
        description: `${role} role added successfully.`,
      });
    } catch (error) {
      console.error('Failed to add role:', error);
      toast({
        title: "Error",
        description: "Failed to add role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    try {
      await api.removeUserRole(userId, role);
      await loadUsers();
      toast({
        title: "Success",
        description: `${role} role removed successfully.`,
      });
    } catch (error) {
      console.error('Failed to remove role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await api.activateUser(userId);
      await loadUsers();
      toast({
        title: "Success",
        description: "User activated successfully.",
      });
    } catch (error) {
      console.error('Failed to activate user:', error);
      toast({
        title: "Error",
        description: "Failed to activate user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await api.deactivateUser(userId);
      await loadUsers();
      toast({
        title: "Success",
        description: "User deactivated successfully.",
      });
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      await loadUsers();
      await loadUserCount();
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignTeacher = async () => {
    if (!teacherEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.assignTeacherProfile(teacherEmail);
      await loadUsers();
      setTeacherEmail("");
      toast({
        title: "Success",
        description: "Teacher profile assigned successfully.",
      });
    } catch (error) {
      console.error('Failed to assign teacher profile:', error);
      toast({
        title: "Error",
        description: "Failed to assign teacher profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string): "default" | "secondary" | "destructive" => {
    switch (role) {
      case 'ROLE_ADMIN': return 'destructive';
      case 'ROLE_TEACHER': return 'secondary';
      case 'ROLE_STUDENT': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status?: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'INACTIVE': return 'destructive';
      default: return 'secondary';
    }
  };

  const getUserRoles = (user: User): string[] => {
    return user.roles || (user.role ? [user.role] : []);
  };

  if (!isAuthenticated || !roles.includes('ROLE_ADMIN')) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, roles, and system administration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => !u.status || u.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => getUserRoles(u).includes('ROLE_TEACHER')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => getUserRoles(u).includes('ROLE_STUDENT')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                <SelectItem value="ROLE_TEACHER">Teacher</SelectItem>
                <SelectItem value="ROLE_STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Teacher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Teacher Profile</DialogTitle>
                  <DialogDescription>
                    Enter the email address of the user to assign a teacher profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="user@example.com"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                  />
                  <Button onClick={handleAssignTeacher} className="w-full">
                    Assign Teacher Profile
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const userRoles = getUserRoles(user);
                  const status = user.status || 'ACTIVE';
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {userRoles.map((role) => (
                            <Badge
                              key={role}
                              variant={getRoleColor(role)}
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {/* Add Role */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <UserPlus className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Role</DialogTitle>
                                <DialogDescription>
                                  Add a new role to {user.firstName} {user.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ROLE_STUDENT">Student</SelectItem>
                                    <SelectItem value="ROLE_TEACHER">Teacher</SelectItem>
                                    <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  onClick={() => handleAddRole(user.id, newRole)}
                                  className="w-full"
                                >
                                  Add Role
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Remove Role */}
                          {userRoles.length > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <UserMinus className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Remove Role</DialogTitle>
                                  <DialogDescription>
                                    Remove a role from {user.firstName} {user.lastName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {userRoles.map((role) => (
                                    <Button
                                      key={role}
                                      variant="outline"
                                      onClick={() => handleRemoveRole(user.id, role)}
                                      className="w-full justify-start"
                                    >
                                      Remove {role}
                                    </Button>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* Activate/Deactivate */}
                          {status === 'ACTIVE' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeactivateUser(user.id)}
                            >
                              <ShieldOff className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleActivateUser(user.id)}
                            >
                              <Shield className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Delete User */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.firstName} {user.lastName}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanelPage;