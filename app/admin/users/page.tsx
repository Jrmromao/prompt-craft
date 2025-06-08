import { Suspense } from 'react';
import { UsersTable } from './components/UsersTable';
import { getUsers } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, UserCheck, UserX, Shield, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * @param {{ searchParams?: { search?: string; role?: string } }} props
 */
// @ts-expect-error - Clerk types are incomplete
export default async function UsersPage({ searchParams }) {
  const users = await getUsers({ search: searchParams?.search, role: searchParams?.role });

  const activeUsers = users.filter((u: any) => u.status === 'ACTIVE').length;
  const newUsersThisWeek = users.filter((u: any) => {
    const created = new Date(u.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  }).length;
  const suspendedUsers = users.filter((u: any) => u.status === 'SUSPENDED').length;

  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage user accounts, roles, and permissions across your platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Shield className="mr-2 h-4 w-4" />
            Admin Access
          </Badge>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Users
            </CardTitle>
            <Users className="h-5 w-5 text-blue-700 dark:text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {users?.length || 0}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">All registered users</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Active Users
            </CardTitle>
            <UserCheck className="h-5 w-5 text-green-700 dark:text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {activeUsers}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">Currently active accounts</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              New This Week
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-700 dark:text-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {newUsersThisWeek}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Users joined in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Suspended
            </CardTitle>
            <UserX className="h-5 w-5 text-red-700 dark:text-red-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {suspendedUsers}
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">Accounts under review</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-gray-500" />
              User Directory
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last Updated: {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense
            fallback={
              <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
              </div>
            }
          >
            <UsersTable initialUsers={users} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
