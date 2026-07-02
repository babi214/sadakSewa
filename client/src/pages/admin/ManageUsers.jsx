import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { FormField, Input, Select } from '../../components/common/Input'
import { Skeleton } from '../../components/common/Skeleton'
import { userService } from '../../services/userService'
import { formatDate } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/validators'

const ROLES = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'worker', label: 'Worker' },
  { value: 'admin', label: 'Admin' },
]

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (roleFilter) params.role = roleFilter

      const response = await userService.getUsers(params)
      if (response.success) setUsers(response.users)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load users'))
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId, role) => {
    setUpdatingId(userId)
    try {
      const response = await userService.updateUser(userId, { role })
      if (response.success) {
        toast.success('Role updated')
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? response.user : u))
        )
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update role'))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleActive = async (userId, isActive) => {
    setUpdatingId(userId)
    try {
      const response = await userService.updateUser(userId, { isActive: !isActive })
      if (response.success) {
        toast.success(response.user.isActive ? 'User activated' : 'User deactivated')
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? response.user : u))
        )
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update user'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Manage Users</h1>
        <p className="mt-1 text-muted">View users, assign roles, and manage account status</p>
      </div>

      <Card padding="md">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Search users">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-9"
              />
            </div>
          </FormField>
          <FormField label="Filter by role">
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white py-20 text-center">
          <Users className="h-12 w-12 text-muted/30" />
          <p className="mt-4 text-muted">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.fullName}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      user.fullName?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{user.fullName}</p>
                    <p className="text-sm text-muted">{user.email}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                      <span className="capitalize">{user.role}</span>
                      <span>·</span>
                      <span>{formatDate(user.createdAt)}</span>
                      {!user.isActive && (
                        <span className="font-medium text-danger">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={updatingId === user._id}
                    className="w-full sm:w-32 py-2 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                  <Button
                    variant={user.isActive ? 'outline' : 'accent'}
                    size="sm"
                    disabled={updatingId === user._id}
                    onClick={() => handleToggleActive(user._id, user.isActive)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-secondary">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          Promote users to <strong>Worker</strong> to allow admins to assign them reports.
          Workers can update report status on their assigned tasks.
        </p>
      </div>
    </div>
  )
}
