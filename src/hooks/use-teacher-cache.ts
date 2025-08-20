import { useState, useEffect } from 'react';
import { api, TeacherInfo } from '@/lib/api';

// In-memory cache for teacher information
const teacherCache = new Map<string, TeacherInfo>();
const teacherPromises = new Map<string, Promise<TeacherInfo>>();

export function useTeacherInfo(teacherId: string) {
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

    // Check cache first
    if (teacherCache.has(teacherId)) {
      setTeacherInfo(teacherCache.get(teacherId)!);
      setLoading(false);
      return;
    }

    // Check if there's already a pending request
    if (teacherPromises.has(teacherId)) {
      teacherPromises.get(teacherId)!
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
    const promise = api.getTeacherById(teacherId);
    teacherPromises.set(teacherId, promise);

    promise
      .then((info) => {
        teacherCache.set(teacherId, info);
        teacherPromises.delete(teacherId);
        setTeacherInfo(info);
        setLoading(false);
      })
      .catch((err) => {
        teacherPromises.delete(teacherId);
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