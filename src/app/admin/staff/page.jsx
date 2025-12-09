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
                        <p className="font-medium">{staffDetails.fullName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Staff ID</Label>
                        <p className="font-medium">{staffDetails.staffId || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          Department
                        </Label>
                        <p className="font-medium">{staffDetails.department || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          Phone
                        </Label>
                        <p className="font-medium">{staffDetails.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Hire Date
                        </Label>
                        <p className="font-medium">{formatDate(staffDetails.hireDate)}</p>
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

