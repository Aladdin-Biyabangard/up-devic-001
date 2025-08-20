import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  UserCheck, 
  Shield, 
  UserX, 
  Search, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  ShieldOff, 
  BarChart3,
  Mail,
  Plus,
  Filter,
  Home,
  Settings
} from "lucide-react";

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';
type UserStatus = 'ACTIVE' | 'INACTIVE';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
}

const AdminPanelPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'roles'>('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Placeholder data for demonstration
  const placeholderUsers: User[] = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      roles: ["ADMIN"],
      status: "ACTIVE"
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      roles: ["TEACHER"],
      status: "ACTIVE"
    },
    {
      id: "3",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@example.com",
      roles: ["STUDENT"],
      status: "ACTIVE"
    },
    {
      id: "4",
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah.wilson@example.com",
      roles: ["TEACHER", "STUDENT"],
      status: "INACTIVE"
    },
    {
      id: "5",
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@example.com",
      roles: ["STUDENT"],
      status: "ACTIVE"
    },
    {
      id: "6",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@example.com",
      roles: ["TEACHER"],
      status: "ACTIVE"
    }
  ];

  const [users] = useState<User[]>(placeholderUsers);

  // Check authentication
  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  // Filter users based on search term and role
  const getFilteredUsers = () => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== "ALL") {
      filtered = filtered.filter(u => u.roles.includes(selectedRole as UserRole));
    }
    
    return filtered;
  };

  const handleAssignTeacher = () => {
    if (!teacherEmail) {
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }

    setShowSuccessMessage(true);
    setTeacherEmail("");
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const getRoleColor = (role: UserRole): "default" | "secondary" | "destructive" => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'TEACHER': return 'secondary';
      case 'STUDENT': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: UserStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'INACTIVE': return 'destructive';
      default: return 'secondary';
    }
  };

  const currentFilteredUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0 z-10">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">User Management System</p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === 'dashboard'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('users')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === 'users'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  Users
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('roles')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === 'roles'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Roles
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
                <p className="text-gray-600">Overview of system statistics and user management</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{users.length}</div>
                    <p className="text-xs text-gray-500 mt-1">All registered users</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {users.filter(u => u.status === 'ACTIVE').length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Currently active</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Teachers</CardTitle>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {users.filter(u => u.roles.includes('TEACHER')).length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Teaching staff</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <UserX className="h-5 w-5 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {users.filter(u => u.roles.includes('STUDENT')).length}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enrolled students</p>
                  </CardContent>
                </Card>
              </div>

              {/* Teacher Assignment Section */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                    Teacher Assignment
                  </CardTitle>
                  <p className="text-sm text-gray-600">Assign teacher profiles to existing users</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter email address to assign teacher profile"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <Button 
                      onClick={handleAssignTeacher}
                      className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Teacher
                    </Button>
                  </div>
                  
                  {/* Success/Error Messages */}
                  {showSuccessMessage && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2">
                      <p className="text-green-800 text-sm font-medium">✓ Teacher profile assigned successfully!</p>
                    </div>
                  )}
                  {showErrorMessage && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2">
                      <p className="text-red-800 text-sm font-medium">✗ Please enter a valid email address.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Management Section */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
                <p className="text-gray-600">Manage all users, their roles, and account status</p>
              </div>

              {/* Search and Filters */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Filter className="h-5 w-5 mr-2 text-gray-600" />
                    Search & Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-full md:w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                        <SelectItem value="STUDENT">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Users ({currentFilteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">First Name</TableHead>
                          <TableHead className="font-semibold text-gray-700">Last Name</TableHead>
                          <TableHead className="font-semibold text-gray-700">Email</TableHead>
                          <TableHead className="font-semibold text-gray-700">Roles</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentFilteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <TableCell className="font-medium text-gray-900">{user.firstName}</TableCell>
                            <TableCell className="font-medium text-gray-900">{user.lastName}</TableCell>
                            <TableCell className="text-gray-600">{user.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                  <Badge
                                    key={role}
                                    variant={getRoleColor(role)}
                                    className="text-xs font-medium px-2 py-1"
                                  >
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={getStatusColor(user.status)}
                                className="font-medium px-2 py-1"
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {/* Activate/Deactivate Toggle */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-gray-100 transition-all duration-200 border-gray-300 hover:border-gray-400"
                                >
                                  {user.status === 'ACTIVE' ? (
                                    <>
                                      <ShieldOff className="h-3 w-3 mr-1" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="h-3 w-3 mr-1" />
                                      Activate
                                    </>
                                  )}
                                </Button>

                                {/* Assign Role */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 border-gray-300"
                                    >
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      Assign Role
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Assign Role</DialogTitle>
                                      <DialogDescription>
                                        Assign a new role to {user.firstName} {user.lastName}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Select>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="STUDENT">Student</SelectItem>
                                          <SelectItem value="TEACHER">Teacher</SelectItem>
                                          <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        Assign Role
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {/* Remove Role */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 border-gray-300"
                                    >
                                      <UserMinus className="h-3 w-3 mr-1" />
                                      Remove Role
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
                                      {user.roles.map((role) => (
                                        <Button
                                          key={role}
                                          variant="outline"
                                          className="w-full justify-start hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                        >
                                          Remove {role}
                                        </Button>
                                      ))}
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {/* Delete User */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="hover:bg-red-700 transition-all duration-200"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
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
                                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Roles Section */}
          {activeSection === 'roles' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Role Management</h2>
                <p className="text-gray-600">Filter and manage users by their assigned roles</p>
              </div>

              {/* Role Filter */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Shield className="h-5 w-5 mr-2 text-gray-600" />
                    Filter by Role
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select role to filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Filtered Users Table */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Users with {selectedRole === 'ALL' ? 'All' : selectedRole} Role 
                    ({currentFilteredUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">First Name</TableHead>
                          <TableHead className="font-semibold text-gray-700">Last Name</TableHead>
                          <TableHead className="font-semibold text-gray-700">Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentFilteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <TableCell className="font-medium text-gray-900">{user.firstName}</TableCell>
                            <TableCell className="font-medium text-gray-900">{user.lastName}</TableCell>
                            <TableCell className="text-gray-600">{user.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;