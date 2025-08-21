import { useState, useEffect } from 'react';
import { api, TeacherInfo } from '@/lib/api';

// In-memory cache for teacher information
const teacherCache = new Map<string, TeacherInfo>();
const teacherPromises = new Map<string, Promise<TeacherInfo>>();

export function useTeacherInfo(teacherId: string | number) {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // reset state for new teacherId
    setLoading(true);
    setError(null);
    setTeacherInfo(null);

    if (!teacherId) {
      setLoading(false);
      return;
    }

    const teacherIdStr = String(teacherId);

    // Check cache first
    if (teacherCache.has(teacherIdStr)) {
      setTeacherInfo(teacherCache.get(teacherIdStr)!);
      setLoading(false);
      return;
    }

    // Check if there's already a pending request
    if (teacherPromises.has(teacherIdStr)) {
      teacherPromises.get(teacherIdStr)!
        .then((info) => {
          setTeacherInfo(info);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);  
          setLoading(false);
        });
      return;
    }

    // Make the API call
    const promise = api.getTeacherById(String(teacherId));
    teacherPromises.set(teacherIdStr, promise);

    promise
      .then((info) => {
        teacherCache.set(teacherIdStr, info);
        teacherPromises.delete(teacherIdStr);
        setTeacherInfo(info);
        setLoading(false);
      })
      .catch((err) => {
        teacherPromises.delete(teacherIdStr);
        setError(err.message);
        setLoading(false);
      });
  }, [teacherId]);

  return { teacherInfo, loading, error };
}

// Utility function to get teacher display name
export function getTeacherDisplayName(teacherInfo: TeacherInfo | null): string {
  if (!teacherInfo) return 'Unknown Teacher';
  return `${teacherInfo.firstName} ${teacherInfo.lastName}`.trim();
}