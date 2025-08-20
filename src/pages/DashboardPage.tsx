import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, Course } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const roles: string[] = Array.isArray(user?.role)
		? (user?.role as string[])
		: ((user as any)?.roles || JSON.parse(localStorage.getItem("auth_roles") || "[]"));
	const isStudent = roles.includes("ROLE_STUDENT");
	const isTeacher = roles.includes("ROLE_TEACHER");
	const isAdmin = roles.includes("ROLE_ADMIN");

	const [studentCourses, setStudentCourses] = useState<any[]>([]);
	const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				const tasks: Array<Promise<any>> = [];
				if (isStudent) tasks.push(api.getStudentCourses());
				if (isTeacher) tasks.push(api.getTeacherCourses());
				const results = await Promise.all(tasks);
				let idx = 0;
				if (isStudent) {
					const sc = results[idx++];
					setStudentCourses(Array.isArray(sc) ? sc : sc?.content ?? []);
				}
				if (isTeacher) {
					const tc = results[idx++];
					setTeacherCourses(Array.isArray(tc) ? tc : []);
				}
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [isStudent, isTeacher]);

	return (
		<div className="container mx-auto p-4 md:p-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground">Welcome back{user ? `, ${user.firstName}` : ""}!</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{isStudent && (
						<Button variant="outline" onClick={() => navigate("/student")}>Student Panel</Button>
					)}
					{isTeacher && (
						<Button variant="outline" onClick={() => navigate("/teacher")}>Teacher Panel</Button>
					)}
					{isAdmin && (
						<Button variant="outline" onClick={() => navigate("/admin")}>Admin Panel</Button>
					)}
				</div>
			</div>

			{/* Summary */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card>
					<CardHeader>
						<CardTitle>Your Roles</CardTitle>
					</CardHeader>
					<CardContent className="flex gap-2 flex-wrap">
						{roles.length === 0 ? (
							<span className="text-muted-foreground">No roles assigned</span>
						) : (
							roles.map((r) => (
								<Badge key={r} variant={r === "ROLE_ADMIN" ? "destructive" : r === "ROLE_TEACHER" ? "default" : "secondary"}>
									{r}
								</Badge>
							))
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Enrolled Courses</CardTitle>
					</CardHeader>
					<CardContent>
						{isStudent ? (
							<div className="text-3xl font-bold">{studentCourses.length}</div>
						) : (
							<p className="text-muted-foreground">Only for students</p>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className="flex gap-2 flex-wrap">
						<Button asChild size="sm" variant="outline">
							<Link to="/courses">Browse Courses</Link>
						</Button>
						<Button asChild size="sm" variant="outline">
							<Link to="/profile">Edit Profile</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-16">
					<LoadingSpinner />
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{isStudent && (
						<Card className="overflow-hidden">
							<CardHeader>
								<CardTitle>My Courses</CardTitle>
							</CardHeader>
							<CardContent>
								{studentCourses.length === 0 ? (
									<p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{studentCourses.slice(0, 6).map((c: any) => (
											<Card key={c.courseId} className="overflow-hidden">
												{c.photo_url && (
													<img src={c.photo_url} alt={c.title} className="w-full h-32 object-cover" />
												)}
												<CardHeader className="py-3">
													<CardTitle className="text-base">{c.title}</CardTitle>
												</CardHeader>
											</Card>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{isTeacher && (
						<Card className="overflow-hidden">
							<CardHeader>
								<CardTitle>Teaching</CardTitle>
							</CardHeader>
							<CardContent>
								{teacherCourses.length === 0 ? (
									<p className="text-muted-foreground">No courses yet. Create your first course!</p>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{teacherCourses.slice(0, 6).map((c) => (
											<Card key={c.courseId} className="overflow-hidden">
												{c.photo_url && (
													<img src={c.photo_url} alt={c.title} className="w-full h-32 object-cover" />
												)}
												<CardHeader className="py-3">
													<CardTitle className="text-base">{c.title}</CardTitle>
												</CardHeader>
											</Card>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{isAdmin && (
						<Card>
							<CardHeader>
								<CardTitle>Admin</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<p className="text-muted-foreground">Manage users and platform settings.</p>
								<Button onClick={() => navigate("/admin")}>Go to Admin Panel</Button>
							</CardContent>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}


