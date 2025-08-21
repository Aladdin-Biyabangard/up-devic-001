import React from "react";
import { useTeacherInfo, getTeacherDisplayName } from "@/hooks/use-teacher-cache";

interface TeacherNameProps {
  teacherId?: string | number;
  fallbackName?: string;
  className?: string;
  skeletonWidthClass?: string; // e.g., "w-24"
}

export const TeacherName: React.FC<TeacherNameProps> = ({
  teacherId,
  fallbackName,
  className,
  skeletonWidthClass = "w-24",
}) => {
  const { teacherInfo, loading, error } = useTeacherInfo(teacherId || "");

  if (!teacherId && fallbackName) {
    return <span className={className}>{fallbackName}</span>;
  }

  if (loading) {
    return (
      <span className={`bg-muted animate-pulse rounded h-4 inline-block align-middle ${skeletonWidthClass} ${className || ""}`.trim()} />
    );
  }

  if (error) {
    return <span className={className}>Unknown Teacher</span>;
  }

  const name = getTeacherDisplayName(teacherInfo);
  return <span className={className}>{name || "Unknown Teacher"}</span>;
};

export default TeacherName;


