'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Printer,
} from 'lucide-react';
import { ThreeDots } from 'react-loader-spinner';

export default function StaffSchedulePage() {
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('Fall');
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [semesterStartDate, setSemesterStartDate] = useState(
    new Date('2025-09-01')
  );
  const [currentSemesterInfo, setCurrentSemesterInfo] = useState(null);

  // Helper: normalize semester label to a canonical name
  const normalizeSemesterLabel = (semester) => {
    if (!semester) return '';
    const s = semester.toString().trim().toLowerCase();
    if (s === 'fall' || s === '1') return 'Fall';
    if (s === 'spring' || s === '2') return 'Spring';
    if (s === 'summer' || s === '3') return 'Summer';
    return semester;
  };

  // Helper: get semester start date from semester label + year
  const getSemesterStartDate = (semester, year) => {
    const normalized = normalizeSemesterLabel(semester);
    const y = parseInt(year, 10) || new Date().getFullYear();

    if (normalized === 'Fall') {
      // First week of September
      return new Date(y, 8, 1);
    }
    if (normalized === 'Spring') {
      // First week of January
      return new Date(y, 0, 1);
    }
    if (normalized === 'Summer') {
      // Reasonable default for summer term
      return new Date(y, 5, 1); // June 1
    }

    // Fallback: January 1
    return new Date(y, 0, 1);
  };

  // Calculate current week based on today's date and semester start date
  // Each semester lasts 15 weeks (Fall: starts first week of September, Spring: starts first week of January)
  const calculateCurrentWeek = (startDate, semester) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    
    if (today < start) {
      // If today is before semester start, return first week of that semester
      switch (semester) {
        case 'Fall':
          return 1
        case 'Spring':
          return 20
        case 'Summer':
          return 41
        default:
          return 1
      }
    }

    const diffTime = today - start
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const week = Math.floor(diffDays / 7) + 1

    // Determine semester boundaries
    let minWeek, maxWeek
    switch (semester) {
      case 'Fall':
        minWeek = 1
        maxWeek = 19
        break
      case 'Spring':
        minWeek = 20
        maxWeek = 40
        break
      case 'Summer':
        minWeek = 41
        maxWeek = 52
        break
      default:
        minWeek = 1
        maxWeek = 19
    }

    // If calculated week is outside semester range, return first week of semester
    if (week < minWeek || week > maxWeek) {
      return minWeek
    }

    return week
  }

  const [currentWeek, setCurrentWeek] = useState(() =>
  const [currentWeek, setCurrentWeek] = useState(() =>
    calculateCurrentWeek(new Date('2025-09-01'), 'Fall')
  );

  // Generate time units: Unit 1 starts at 8:00 AM, each unit is 50 minutes
  const generateTimeUnits = () => {
    const units = [];
    let hour = 8;
    let minute = 0;

    for (let i = 1; i <= 16; i++) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      minute += 50;
      if (minute >= 60) {
        hour += 1;
        minute -= 60;
      }
      const endTime = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      units.push({ unit: i, startTime, endTime });
    }
    return units;
  };

  const timeUnits = generateTimeUnits();

  // Calculate week date range
  const getWeekDateRange = (week) => {
    const startDate = new Date(semesterStartDate);
    startDate.setDate(startDate.getDate() + (week - 1) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return {
      start: startDate,
      end: endDate,
      formatted: `Week ${week} [${formatDate(startDate)} -- ${formatDate(
        endDate
      )}]`,
    };
  };

  const weekRange = getWeekDateRange(currentWeek);

  // Get day name from day_of_week (1=Monday, 7=Sunday)
  const getDayName = (dayOfWeek) => {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return days[dayOfWeek - 1];
  };

  // Convert time string (HH:MM or HH:MM:SS) to minutes since midnight
  const timeToMinutes = (timeStr) => {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  };

  // Get unit number from time (Unit 1 starts at 8:00 = 480 minutes)
  const getUnitFromTime = (timeStr) => {
    const minutes = timeToMinutes(timeStr);
    const startMinutes = 8 * 60; // 8:00 AM
    const diff = minutes - startMinutes;
    if (diff < 0) return null;
    const unit = Math.floor(diff / 50) + 1;
    return unit <= 16 ? unit : null;
  };

  // Get number of units a class spans
  const getUnitsSpan = (startTime, endTime) => {
    const startUnit = getUnitFromTime(startTime);
    const endUnit = getUnitFromTime(endTime);
    if (!startUnit || !endUnit) return 1;
    return Math.max(1, endUnit - startUnit);
  };

  // Organize data by day and unit
  const organizeTimetable = () => {
    const organized = {};
    const spannedCells = new Set(); // Track cells that are part of a rowspan

    for (let day = 1; day <= 7; day++) {
      organized[day] = {};
      for (let unit = 1; unit <= 16; unit++) {
        organized[day][unit] = null;
      }
    }

    timetableData.forEach((item) => {
      const unit = getUnitFromTime(item.start_time);
      if (unit) {
        const unitsSpan = getUnitsSpan(item.start_time, item.end_time);
        if (!organized[item.day_of_week][unit]) {
          organized[item.day_of_week][unit] = {
            ...item,
            unitsSpan,
          };
          // Mark subsequent units as spanned
          for (let i = 1; i < unitsSpan; i++) {
            spannedCells.add(`${item.day_of_week}-${unit + i}`);
          }
        }
      }
    });

    return { organized, spannedCells };
  };

  const { organized: organizedData, spannedCells } = organizeTimetable();

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const handleFirstWeek = () => {
    setCurrentWeek(1);
  };

  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < 15) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const handleLastWeek = () => {
    // Semester lasts 15 weeks
    setCurrentWeek(15);
  };

  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/staff/semesters');
      const data = await response.json();

      if (data.success && data.semesters.length > 0) {
        const semesters = data.semesters;
        setAvailableSemesters(semesters);

        // Determine current semester based on today's date
        const today = new Date();
        const year = today.getFullYear();
        const fallStart = new Date(year, 8, 1); // September 1
        const springStart = new Date(year, 0, 1); // January 1

        let targetLabel = 'Spring';
        let targetYear = year;
        if (today >= fallStart) {
          targetLabel = 'Fall';
          targetYear = year;
        } else if (today >= springStart) {
          targetLabel = 'Spring';
          targetYear = year;
        }

        const currentSem =
          semesters.find(
            (s) =>
              normalizeSemesterLabel(s.semester) === targetLabel &&
              Number(s.year) === targetYear
          ) || semesters[0];

        setCurrentSemesterInfo(currentSem);
        setSelectedSemester(currentSem.semester);
        setSelectedYear(currentSem.year.toString());

        const startDate = getSemesterStartDate(
          currentSem.semester,
          currentSem.year
        );
        setSemesterStartDate(startDate);
        setCurrentWeek(calculateCurrentWeek(startDate, currentSem.semester));
      } else {
        // Default fallback: build semesters around current academic year
        const currentYear = new Date().getFullYear();
        const fallbackSemesters = [
          { semester: 'Fall', year: currentYear },
          { semester: 'Spring', year: currentYear + 1 },
          { semester: 'Summer', year: currentYear + 1 },
        ];
        setAvailableSemesters(fallbackSemesters);

        // Choose current semester from fallback
        const today = new Date();
        const year = today.getFullYear();
        const fallStart = new Date(year, 8, 1);
        const springStart = new Date(year, 0, 1);
        let targetLabel = 'Spring';
        let targetYear = year;
        if (today >= fallStart) {
          targetLabel = 'Fall';
          targetYear = year;
        } else if (today >= springStart) {
          targetLabel = 'Spring';
          targetYear = year;
        }

        const currentSem =
          fallbackSemesters.find(
            (s) =>
              normalizeSemesterLabel(s.semester) === targetLabel &&
              Number(s.year) === targetYear
          ) || fallbackSemesters[0];

        setCurrentSemesterInfo(currentSem);
        setSelectedSemester(currentSem.semester);
        setSelectedYear(currentSem.year.toString());

        const startDate = getSemesterStartDate(
          currentSem.semester,
          currentSem.year
        );
        setSemesterStartDate(startDate);
        setCurrentWeek(calculateCurrentWeek(startDate, currentSem.semester));
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
      // Default fallback in case of error
      const currentYear = new Date().getFullYear();
      const fallbackSemesters = [
        { semester: 'Fall', year: currentYear },
        { semester: 'Spring', year: currentYear + 1 },
        { semester: 'Summer', year: currentYear + 1 },
      ];
      setAvailableSemesters(fallbackSemesters);

      const today = new Date();
      const year = today.getFullYear();
      const fallStart = new Date(year, 8, 1);
      const springStart = new Date(year, 0, 1);
      let targetLabel = 'Spring';
      let targetYear = year;
      if (today >= fallStart) {
        targetLabel = 'Fall';
        targetYear = year;
      } else if (today >= springStart) {
        targetLabel = 'Spring';
        targetYear = year;
      }

      const currentSem =
        fallbackSemesters.find(
          (s) =>
            normalizeSemesterLabel(s.semester) === targetLabel &&
            Number(s.year) === targetYear
        ) || fallbackSemesters[0];

      setCurrentSemesterInfo(currentSem);
      setSelectedSemester(currentSem.semester);
      setSelectedYear(currentSem.year.toString());

      const startDate = getSemesterStartDate(
        currentSem.semester,
        currentSem.year
      );
      setSemesterStartDate(startDate);
      setCurrentWeek(calculateCurrentWeek(startDate, currentSem.semester));
    }
  };

  const fetchTimetable = async () => {
    if (!selectedSemester || !selectedYear) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/staff/timetable?semester=${selectedSemester}&year=${selectedYear}&week=${currentWeek}`
      );
      const data = await response.json();

      if (data.success) {
        setTimetableData(data.data || []);
      } else {
        console.error('Error fetching timetable:', data.error);
        setTimetableData([]);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setTimetableData([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSetFirstWeek = () => {
    setCurrentWeek(calculateCurrentWeek(semesterStartDate, selectedSemester))
  }

  // Fetch available semesters on mount
  useEffect(() => {
    fetchSemesters();
  }, []);

  // When selected semester/year changes, update start date and week
  useEffect(() => {
    if (!selectedSemester || !selectedYear) return;

    const startDate = getSemesterStartDate(selectedSemester, selectedYear);
    setSemesterStartDate(startDate);

    // If this is the real current semester, use the real current week.
    // Otherwise (outside current semester), default to week 1.
    if (
      currentSemesterInfo &&
      normalizeSemesterLabel(currentSemesterInfo.semester) ===
        normalizeSemesterLabel(selectedSemester) &&
      String(currentSemesterInfo.year) === String(selectedYear)
    ) {
      setCurrentWeek(calculateCurrentWeek(startDate, selectedSemester));
    } else {
      setCurrentWeek(1);
    }
  }, [selectedSemester, selectedYear, currentSemesterInfo]);

  // Fetch timetable data
  useEffect(() => {
    fetchTimetable();
  }, [selectedSemester, selectedYear, currentWeek]);

  if (loading && timetableData.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <ThreeDots
          visible={true}
          height="100"
          width="100"
          color="#4fa94d"
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 bg-background font-roboto">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <label className="text-sm font-medium">Select semester</label>
            <select
              value={`${selectedSemester}-${selectedYear}`}
              onChange={(e) => {
                const [sem, year] = e.target.value.split('-');
                setSelectedSemester(sem);
                setSelectedYear(year);
              }}
              className="px-3 py-2 border rounded-md bg-background cursor-pointer"
            >
              {availableSemesters.map((sem) => (
                <option
                  key={`${sem.semester}-${sem.year}`}
                  value={`${sem.semester}-${sem.year}`}
                >
                  Semester {sem.semester}, Academic year {sem.year}-
                  {String(sem.year + 1).slice(-2)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium">Weekly timetable</label>
          <div className="relative">
            <input
              type="text"
              value={weekRange.formatted}
              readOnly
              className="px-3 py-2 border rounded-md bg-background w-72"
            />
          </div>
          <Button onClick={handlePrint} variant="outline" className="ml-auto">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      {timetableData.length === 0 && !loading ? (
        <div className="border rounded-lg p-8 text-center bg-card">
          <p className="text-muted-foreground">
            No timetable data available for Semester {selectedSemester}, Year{' '}
            {selectedYear}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr>
                <th className="bg-primary text-primary-foreground p-2 text-center font-semibold text-sm border">
                  Time
                </th>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <th
                    key={day}
                    className="bg-primary text-primary-foreground p-2 text-center font-semibold text-sm border w-fit"
                  >
                    {getDayName(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeUnits.map(({ unit, startTime, endTime }) => {
                const rowCells = [];

                // Left Time Label
                rowCells.push(
                  <td
                    key={`left-${unit}`}
                    className="bg-muted p-2 text-center text-xs font-medium border"
                  >
                    Period {unit} <br />
                    {startTime} - {endTime}
                  </td>
                );

                // Day Columns
                for (let day = 1; day <= 7; day++) {
                  const cellKey = `${day}-${unit}`;

                  // Skip if this cell is part of a rowspan from a previous unit
                  if (spannedCells.has(cellKey)) {
                    continue;
                  }

                  const schedule = organizedData[day][unit];
                  const startUnit = schedule
                    ? getUnitFromTime(schedule.start_time)
                    : null;

                  if (schedule && startUnit === unit) {
                    const rowSpan = schedule.unitsSpan || 1;
                    rowCells.push(
                      <td
                        key={cellKey}
                        rowSpan={rowSpan}
                        className="bg-yellow-500 dark:bg-yellow-700 text-white p-2 border align-top w-64"
                      >
                        <div className="flex flex-col w-fit">
                          <span className="font-semibold text-sm">
                            {schedule.subject_name}
                          </span>
                          <span className="text-sm mt-1">
                            {schedule.room_name}
                          </span>
                          <span className="text-sm mt-1">
                            {formatTime(schedule.start_time)} -{' '}
                            {formatTime(schedule.end_time)}
                          </span>
                        </div>
                      </td>
                    );
                  } else {
                    rowCells.push(
                      <td
                        key={cellKey}
                        className="bg-background p-2 border min-h-[60px]"
                      ></td>
                    );
                  }
                }

                return <tr key={unit}>{rowCells}</tr>;
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex gap-2">
          <Button onClick={handleFirstWeek} variant="outline" size="sm">
            <ChevronsLeft className="w-4 h-4 mr-1" />
            First week
          </Button>
          <Button onClick={handlePreviousWeek} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous week
          </Button>
          <Button onClick={handleNextWeek} variant="outline" size="sm">
            Next week
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button onClick={handleLastWeek} variant="outline" size="sm">
            Last week
            <ChevronsRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
