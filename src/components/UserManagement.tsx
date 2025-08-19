import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { canCreateUsers, canChangeUserRoles, canDeleteUsers, isSuperAdmin } = usePermissions();

  // Form state
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "teacher"
  });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast({
        description: "Missing required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });

      if (error) throw error;

      if (data.success) {
        setNewUser({ email: "", password: "", firstName: "", lastName: "", role: "teacher" });
        setIsCreateModalOpen(false);
        fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (error) {
      toast({
        title: "Error creating user",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { action: 'delete', userId }
      });

      if (error) throw error;

      if (data.success) {
        fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast({
        title: "Error deleting user",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'super_admin':
        return 'default';
      case 'teacher':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayText = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrator';
      case 'teacher':
        return 'Teacher';
      default:
        return role;
    }
  };

  return (
    <div className={isMobile ? "space-y-3" : "space-y-6"}>
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between items-center'}`}>
        <div>
          <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>User Management</h2>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            {isMobile ? 'Manage users' : 'Manage teachers and administrators'}
          </p>
        </div>
        
        {canCreateUsers && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size={isMobile ? "sm" : "default"} className={isMobile ? "text-xs px-2" : ""}>
                <UserPlus className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                {isMobile ? 'Add' : 'Add User'}
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    {isSuperAdmin && (
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createUser} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className={`grid ${isSuperAdmin ? 'grid-cols-4' : 'grid-cols-3'} ${isMobile ? 'gap-2' : 'gap-4'}`}>
        <Card>
          <CardHeader className={`pb-1 ${isMobile ? 'p-2' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
              {isMobile ? 'Total' : 'Total Users'}
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "p-2 pt-0" : ""}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={`pb-1 ${isMobile ? 'p-2' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>Teachers</CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "p-2 pt-0" : ""}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{users.filter(u => u.role === 'teacher').length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={`pb-1 ${isMobile ? 'p-2' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
              {isMobile ? 'Admins' : 'Administrators'}
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "p-2 pt-0" : ""}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{users.filter(u => u.role === 'admin').length}</div>
          </CardContent>
        </Card>
        
        {isSuperAdmin && (
          <Card>
            <CardHeader className={`pb-1 ${isMobile ? 'p-2' : 'pb-2'}`}>
              <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
                {isMobile ? 'Super' : 'Super Admins'}
              </CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "p-2 pt-0" : ""}>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{users.filter(u => u.role === 'super_admin').length}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />
        <Input
          placeholder={isMobile ? "Search..." : "Search users..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={isMobile ? "text-sm" : "max-w-sm"}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isMobile ? "text-xs" : ""}>
                  {isMobile ? 'User' : 'Name'}
                </TableHead>
                {!isMobile && <TableHead>Email</TableHead>}
                <TableHead className={isMobile ? "text-xs" : ""}>Role</TableHead>
                {!isMobile && <TableHead>Created</TableHead>}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 3 : 5} className={`text-center ${isMobile ? 'py-4 text-sm' : 'py-8'}`}>
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 3 : 5} className={`text-center ${isMobile ? 'py-4 text-sm' : 'py-8'}`}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                      <div>
                        <div>{user.full_name}</div>
                        {isMobile && (
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        )}
                      </div>
                    </TableCell>
                    {!isMobile && <TableCell className="text-sm">{user.email}</TableCell>}
                    <TableCell>
                      <Badge variant={getRoleColor(user.role)} className={isMobile ? "text-xs px-1.5 py-0.5" : ""}>
                        {getRoleDisplayText(user.role)}
                      </Badge>
                    </TableCell>
                    {!isMobile && (
                      <TableCell className="text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    )}
                    <TableCell>
                      {(canChangeUserRoles || canDeleteUsers) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size={isMobile ? "sm" : "sm"}>
                              <MoreHorizontal className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border shadow-md">
                            {canChangeUserRoles && (
                              <>
                                {user.role === 'teacher' && (
                                  <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>
                                    <Edit className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                                    <span className={isMobile ? "text-xs" : ""}>Make Administrator</span>
                                  </DropdownMenuItem>
                                )}
                                {user.role === 'admin' && (
                                  <>
                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'teacher')}>
                                      <Edit className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                                      <span className={isMobile ? "text-xs" : ""}>Make Teacher</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'super_admin')}>
                                      <Edit className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                                      <span className={isMobile ? "text-xs" : ""}>Make Super Admin</span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {user.role === 'super_admin' && (
                                  <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>
                                    <Edit className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                                    <span className={isMobile ? "text-xs" : ""}>Make Administrator</span>
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            {canDeleteUsers && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                                    <span className={isMobile ? "text-xs" : ""}>Delete User</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.full_name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}