'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  Home,
} from 'lucide-react';
import Link from 'next/link';

const timeSlots = (() => {
  const slots = [];
  const startMinutes = 8 * 60; // 8:00
  const endMinutes = 21 * 60 + 20; // 21:20
  let m = startMinutes;
  while (m <= endMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const label = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    slots.push(label);
    m += 50;
  }
  return slots;
})();

const toDateInput = (d) => d.toISOString().split('T')[0];

const weekRangeText = (weekStart) => {
  if (!weekStart) return '';
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${toDateInput(start)} → ${toDateInput(end)}`;
};

export default function AssignRoomPage() {
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [overrideDate, setOverrideDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:50');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [note, setNote] = useState('');
  const [checking, setChecking] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, roomsRes] = await Promise.all([
        fetch('/api/admin/classes'),
        fetch('/api/admin/rooms'),
      ]);
      const classesJson = await classesRes.json();
      const roomsJson = await roomsRes.json();
      if (classesJson.success) setClasses(classesJson.data || []);
      if (roomsJson.success) setRooms(roomsJson.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId]
  );

  // Ensure end time is after start time
  useEffect(() => {
    const startIdx = timeSlots.indexOf(startTime);
    const endIdx = timeSlots.indexOf(endTime);
    if (startIdx !== -1 && endIdx !== -1 && endIdx <= startIdx) {
      const newEnd = timeSlots[Math.min(startIdx + 1, timeSlots.length - 1)];
      setEndTime(newEnd);
    }
  }, [startTime]);

  const handleCheckOrAssign = async (checkOnly) => {
    setError('');
    setResult(null);
    if (!selectedClassId || !selectedRoomId || !overrideDate || !startTime || !endTime) {
      setError('Please fill all required fields.');
      return;
    }
    // Validate date within week (optional)
    if (weekStart) {
      const ws = new Date(weekStart);
      const od = new Date(overrideDate);
      const diff = (od - ws) / (1000 * 60 * 60 * 24);
      if (diff < 0 || diff > 6) {
        setError('Override date must be within the selected week.');
        return;
      }
    }
    checkOnly ? setChecking(true) : setAssigning(true);
    try {
      const res = await fetch('/api/admin/room-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          roomId: selectedRoomId,
          overrideDate,
          startTime,
          endTime,
          note,
          checkOnly,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Operation failed');
        setResult(data);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error');
    } finally {
      setChecking(false);
      setAssigning(false);
    }
  };

  const filteredEndSlots = timeSlots.filter((t) => t > startTime);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="w-8 h-8" />
            Assign Room (Admin)
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose class → week/date → room → time. Overrides weekly timetable for that day.
          </p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Class</Label>
              <select
                className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} • {c.subject?.code} • {c.semester} {c.year}
                  </option>
                ))}
              </select>
              {selectedClass && (
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <div>Subject: {selectedClass.subject?.code} - {selectedClass.subject?.name}</div>
                  <div>Staff: {selectedClass.staff?.fullName || 'N/A'}</div>
                  <div>Semester: {selectedClass.semester} {selectedClass.year}</div>
                  <div>Enrollment: {selectedClass.enrollmentCount || 0}</div>
                </div>
              )}
            </div>

            <div>
              <Label>Room</Label>
              <select
                className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
              >
                <option value="">Select room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Week start (optional)</Label>
              <Input
                type="date"
                className="mt-1"
                value={weekStart}
                onChange={(e) => {
                  setWeekStart(e.target.value);
                  // auto-set overrideDate to week start if empty
                  if (!overrideDate && e.target.value) setOverrideDate(e.target.value);
                }}
              />
              {weekStart && (
                <p className="text-xs text-muted-foreground mt-1">
                  Week range: {weekRangeText(weekStart)}
                </p>
              )}
            </div>

            <div>
              <Label>Date (override)</Label>
              <Input
                type="date"
                className="mt-1"
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
              />
              {weekStart && overrideDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Must be within the selected week.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Start time</Label>
                <select
                  className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>End time</Label>
                <select
                  className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {filteredEndSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <Label>Note (optional)</Label>
            <Input
              className="mt-1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason or context for this override"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div
              className={`flex items-start gap-2 text-sm ${
                result.available === false || result.success === false
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {result.available === false || result.success === false ? (
                <AlertCircle className="w-4 h-4 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mt-0.5" />
              )}
              <div>
                {result.available === false || result.success === false
                  ? 'Room not available'
                  : 'Success'}
                {result.conflicts && result.conflicts.length > 0 && (
                  <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {result.conflicts.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {c.className} ({c.startTime || '??'} - {c.endTime || '??'}) [{c.type}]
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={checking || assigning}
              onClick={() => handleCheckOrAssign(true)}
            >
              {checking ? 'Checking...' : 'Check availability'}
            </Button>
            <Button
              type="button"
              disabled={checking || assigning}
              onClick={() => handleCheckOrAssign(false)}
            >
              {assigning ? 'Assigning...' : 'Assign room'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

