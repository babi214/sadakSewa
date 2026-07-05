import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Mail, MapPin, Phone, Search, Shield, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { FormField, Input, Select } from '../../components/common/Input'
import { Skeleton } from '../../components/common/Skeleton'
import { userService } from '../../services/userService'
import { locationService } from '../../services/locationService'
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
  const [updatingId, setUpdatingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [provinceFilter, setProvinceFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [municipalityFilter, setMunicipalityFilter] = useState('')
  useEffect(() => {
    locationService.getProvinces().then(res => setProvinces(res.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (provinceFilter) {
      const province = provinces.find(p => p.name === provinceFilter)
      locationService.getDistricts(province?.id).then(res => setDistricts(res.data || [])).catch(() => {})
    } else {
      setDistricts([])
    }
    setDistrictFilter('')
    setMunicipalityFilter('')
    setMunicipalities([])
  }, [provinceFilter])

  useEffect(() => {
    if (districtFilter) {
      const district = districts.find(d => d.name === districtFilter)
      locationService.getMunicipalities(district?.id).then(res => setMunicipalities(res.data || [])).catch(() => {})
    } else {
      setMunicipalities([])
    }
    setMunicipalityFilter('')
  }, [districtFilter])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (provinceFilter) params.province = provinceFilter
      if (districtFilter) params.district = districtFilter
      if (municipalityFilter) params.municipality = municipalityFilter

      const response = await userService.getUsers(params)
      if (response.success) setUsers(response.users)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load users'))
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, provinceFilter, districtFilter, municipalityFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleClearFilter = () => {
    setSearch('')
    setRoleFilter('')
    setProvinceFilter('')
    setDistrictFilter('')
    setMunicipalityFilter('')
  }

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
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <FormField label="Province">
            <Select value={provinceFilter} onChange={(e) => setProvinceFilter(e.target.value)}>
              <option value="">All provinces</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="District">
            <Select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} disabled={!provinceFilter}>
              <option value="">All districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Municipality">
            <Select value={municipalityFilter} onChange={(e) => setMunicipalityFilter(e.target.value)} disabled={!districtFilter}>
              <option value="">All municipalities</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </Select>
          </FormField>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={handleClearFilter}>
            Clear Filters
          </Button>
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
              <Card className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === user._id ? null : user._id)}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
                    >
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.fullName}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        user.fullName?.charAt(0)?.toUpperCase()
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="font-semibold text-secondary">{user.fullName}</p>
                      <p className="flex items-center gap-1 text-sm text-muted">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                        <span className="capitalize">{user.role}</span>
                        <span>·</span>
                        <span>{formatDate(user.createdAt)}</span>
                        {user.phone && <><span>·</span><span>{user.phone}</span></>}
                        {!user.isActive && (
                          <span className="font-medium text-danger">Inactive</span>
                        )}
                        {user.isVerified && (
                          <span className="font-medium text-accent">Verified</span>
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
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === user._id ? null : user._id)}
                      className="rounded-lg p-2 text-muted hover:bg-secondary/5 transition-colors"
                    >
                      {expandedId === user._id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedId === user._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-border pt-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">Contact</p>
                        <div className="mt-2 space-y-1.5">
                          <p className="flex items-center gap-2 text-sm text-secondary">
                            <Mail className="h-3.5 w-3.5 text-muted" />
                            {user.email}
                          </p>
                          <p className="flex items-center gap-2 text-sm text-secondary">
                            <Phone className="h-3.5 w-3.5 text-muted" />
                            {user.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">Location</p>
                        <div className="mt-2 space-y-1.5">
                          <p className="flex items-center gap-2 text-sm text-secondary">
                            <MapPin className="h-3.5 w-3.5 text-muted" />
                            {[user.province, user.district, user.municipality].filter(Boolean).join(', ') || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">Account</p>
                        <div className="mt-2 space-y-1.5">
                          <p className="text-sm text-secondary">
                            <span className="text-muted">Role:</span> <span className="capitalize font-medium">{user.role}</span>
                          </p>
                          <p className="text-sm text-secondary">
                            <span className="text-muted">Status:</span>{' '}
                            <span className={user.isActive ? 'text-accent font-medium' : 'text-danger font-medium'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                          <p className="text-sm text-secondary">
                            <span className="text-muted">Email verified:</span>{' '}
                            {user.isVerified ? <span className="text-accent font-medium">Yes</span> : <span className="text-danger font-medium">No</span>}
                          </p>
                          <p className="text-sm text-secondary">
                            <span className="text-muted">Joined:</span> {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
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
