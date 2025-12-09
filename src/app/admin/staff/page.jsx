'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Briefcase,
  Search,
  X,
  Calendar,
  GraduationCap,
  DollarSign,
  User,
  Building2,
  Phone,
  Save,
  KeyRound,
} from 'lucide-react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState(['all']);
  const [selectedStaffMember, setSelectedStaffMember] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [staffDetails, setStaffDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [searchQuery, selectedDepartment]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (selectedDepartment !== 'all') {
        params.append('department', selectedDepartment);
      }
      const queryString = params.toString();
      const url = `/api/admin/staff${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStaff(data.data || []);
        setFilteredStaff(data.data || []);
        
        // Extract unique departments
        const uniqueDepartments = ['all', ...new Set(
          (data.data || [])
            .map((s) => s.department)
            .filter((d) => d)
        )];
        setDepartments(uniqueDepartments);
      } else {
        console.error('Error fetching staff:', data.error);
        setStaff([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffDetails = async (staffId) => {
    try {
      setLoadingDetails(true);
      const response = await fetch(`/api/admin/staff?id=${staffId}`);
      const data = await response.json();

      if (data.success) {
        setStaffDetails(data.data);
        setEditStaff({
          fullName: data.data.fullName || '',
          staffId: data.data.staffId || '',
          department: data.data.department || '',
          phone: data.data.phone || '',
          hireDate: data.data.hireDate ? data.data.hireDate.split('T')[0] : '',
        });
      } else {
        console.error('Error fetching staff details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching staff details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStaffClick = (staffMember) => {
    setSelectedStaffMember(staffMember);
    setShowDetails(true);
    fetchStaffDetails(staffMember.id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStaffSave = async () => {
    if (!staffDetails?.userId) {
      alert('Missing user id for this staff');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        userId: staffDetails.userId,
        role: 'staff',
        updates: {
          fullName: editStaff?.fullName || '',
          staffCode: editStaff?.staffId || '',
          department: editStaff?.department || '',
          phone: editStaff?.phone || '',
          dateOfBirth: null,
        },
      };
      if (editStaff?.hireDate) {
        payload.updates.hireDate = editStaff.hireDate;
      }
      if (newPassword) {
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Update failed');
        return;
      }
      await fetchStaffDetails(staffDetails.id);
      await fetchStaff();
      alert('Staff updated successfully');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      alert('Unexpected error while updating staff');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="w-8 h-8" />
          Staff Management
        </h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or staff ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label>Department:</Label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredStaff.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No staff found
              </div>
            ) : (
              filteredStaff.map((staffMember) => (
                <div
                  key={staffMember.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleStaffClick(staffMember)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{staffMember.fullName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>ID: {staffMember.staffId || 'N/A'}</span>
                            <span>•</span>
                            <span>Dept: {staffMember.department || 'N/A'}</span>
                            <span>•</span>
                            <span>Hired: {formatDate(staffMember.hireDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff Details Modal */}
      {showDetails && selectedStaffMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedStaffMember.fullName}</h2>
                <p className="text-muted-foreground mt-1">
                  Staff ID: {selectedStaffMember.staffId || 'N/A'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedStaffMember(null);
                  setStaffDetails(null);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-lg">Loading details...</div>
                </div>
              ) : staffDetails ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Full Name</Label>
                        <Input
                          value={editStaff?.fullName || ''}
                          onChange={(e) =>
                            setEditStaff((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Staff ID</Label>
                        <Input
                          value={editStaff?.staffId || ''}
                          onChange={(e) =>
                            setEditStaff((prev) => ({ ...prev, staffId: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          Department
                        </Label>
                        <Input
                          value={editStaff?.department || ''}
                          onChange={(e) =>
                            setEditStaff((prev) => ({ ...prev, department: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          Phone
                        </Label>
                        <Input
                          value={editStaff?.phone || ''}
                          onChange={(e) =>
                            setEditStaff((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Hire Date
                        </Label>
                        <Input
                          type="date"
                          value={editStaff?.hireDate || ''}
                          onChange={(e) =>
                            setEditStaff((prev) => ({ ...prev, hireDate: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <KeyRound className="w-4 h-4" />
                          New Password (optional)
                        </Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter to reset password"
                        />
                      </div>
                      <div className="flex items-end gap-3">
                        <Button
                          onClick={handleStaffSave}
                          disabled={saving}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save changes'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Classes Taught */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Classes Taught ({staffDetails.classes?.length || 0})
                    </h3>
                    {staffDetails.classes && staffDetails.classes.length > 0 ? (
                      <div className="space-y-2">
                        {staffDetails.classes.map((classItem) => (
                          <Card key={classItem.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{classItem.class_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {classItem.subjects?.code || 'N/A'} - {classItem.subjects?.name || 'N/A'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {classItem.semester} {classItem.year}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No classes found</p>
                    )}
                  </div>

                  {/* Salary Records */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Salary Records ({staffDetails.salaries?.length || 0})
                    </h3>
                    {staffDetails.salaries && staffDetails.salaries.length > 0 ? (
                      <div className="space-y-2">
                        {staffDetails.salaries.map((salary) => (
                          <Card key={salary.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    ${salary.base_salary} {salary.bonus > 0 && `+ $${salary.bonus} bonus`}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(salary.month_year)}
                                  </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  salary.status
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {salary.status ? 'Paid' : 'Pending'}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No salary records found</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load staff details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

