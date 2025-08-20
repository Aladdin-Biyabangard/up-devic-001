import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Upload,
  Camera,
  Settings,
  Bell,
  Shield,
  Eye,
  Edit
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

type RawUserProfile = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePhoto_url?: string;
  profileImageUrl?: string;
  bio?: string;
  socialLinks?: string[];
  socialLink?: string[];
  skills?: string[];
  skill?: string[];
  phone?: string;
  location?: string;
};

type TeacherProfileView = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  website: string;
  linkedin: string;
  twitter: string;
  avatar: string | null;
  specializations: string[];
  hourlyRate: number;
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
};

function extractLinks(raw: string[] | undefined): { website: string; linkedin: string; twitter: string } {
  const links = raw || [];
  const linkedin = links.find((l) => typeof l === "string" && l.toLowerCase().includes("linkedin")) || "";
  const twitter = links.find((l) => typeof l === "string" && (l.toLowerCase().includes("twitter") || l.startsWith("@"))) || "";
  const website = links.find((l) => typeof l === "string" && !l.toLowerCase().includes("linkedin") && !l.toLowerCase().includes("twitter")) || links[0] || "";
  return { website: website || "", linkedin: linkedin || "", twitter: twitter || "" };
}

export function TeacherProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<RawUserProfile>({
    queryKey: ["profile"],
    queryFn: async () => api.getUserProfile(),
    staleTime: 30_000,
  });

  const [profile, setProfile] = useState<TeacherProfileView>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    linkedin: "",
    twitter: "",
    avatar: null,
    specializations: [],
    hourlyRate: 0,
    totalStudents: 0,
    totalCourses: 0,
    averageRating: 0,
  });

  useEffect(() => {
    if (!data) return;
    const socialRaw = data.socialLinks || data.socialLink || [];
    const { website, linkedin, twitter } = extractLinks(Array.isArray(socialRaw) ? socialRaw : []);
    setProfile((prev) => ({
      ...prev,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phone: (data as RawUserProfile).phone || "",
      location: (data as RawUserProfile).location || "",
      bio: data.bio || "",
      website,
      linkedin,
      twitter,
      avatar: data.profilePhoto_url || data.profileImageUrl || null,
      specializations: (data.skills || data.skill || []) as string[],
    }));
  }, [data]);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    courseUpdates: true,
    studentMessages: true,
    marketingEmails: false,
    weeklyReports: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });

  const handleProfileUpdate = async () => {
    try {
      const links = [profile.website, profile.linkedin, profile.twitter].filter(Boolean);
      await api.updateUserProfile({
        bio: profile.bio,
        socialLink: links,
        skill: profile.specializations,
      });
      // refresh cache/state
      const updatedRaw = await api.getUserProfile();
      queryClient.setQueryData(["profile"], updatedRaw);
      toast({ title: "Profile updated" });
    } catch (e) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: "New passwords don't match", variant: "destructive" });
      return;
    }
    try {
      await api.changeUserPassword({ currentPassword: passwords.current, newPassword: passwords.new, retryPassword: passwords.confirm });
      toast({ title: "Password changed" });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (e) {
      toast({ title: "Failed to change password", variant: "destructive" });
    }
  };

  const handleAvatarUpload = () => {
    // Optional: wire a file input here like in ProfilePage if needed
    toast({ title: "Avatar upload not implemented", description: "Use main Profile page to change photo." });
  };

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive text-sm">
        {(error as Error)?.message || "Failed to load profile"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Teacher Profile</h2>
          <p className="text-muted-foreground">Manage your profile and account settings</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Update your profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar || ""} />
                    <AvatarFallback className="text-lg">
                      {profile.firstName[0] || "?"}{profile.lastName[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <Button onClick={handleAvatarUpload} size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Teaching Stats</CardTitle>
                <CardDescription>
                  Your performance overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.totalCourses}</div>
                    <div className="text-sm text-muted-foreground">Total Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.totalStudents}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profile.averageRating}</div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">${profile.hourlyRate}</div>
                    <div className="text-sm text-muted-foreground">Hourly Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) => setProfile({...profile, hourlyRate: parseInt(e.target.value || "0")})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={4}
                  placeholder="Tell students about your background and expertise..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Add your professional links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile({...profile, website: e.target.value})}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={profile.linkedin}
                    onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={profile.twitter}
                    onChange={(e) => setProfile({...profile, twitter: e.target.value})}
                    placeholder="@username or https://twitter.com/username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
              <CardDescription>
                Your areas of expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary">
                    {spec}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-4 w-4 p-0"
                      onClick={() => {
                        const newSpecs = profile.specializations.filter((_, i) => i !== index);
                        setProfile({...profile, specializations: newSpecs});
                      }}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add specialization"
                  onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === "Enter" && target.value.trim()) {
                      setProfile({ ...profile, specializations: [...profile.specializations, target.value.trim()] });
                      target.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>("input[placeholder='Add specialization']");
                    if (input && input.value.trim()) {
                      setProfile({ ...profile, specializations: [...profile.specializations, input.value.trim()] });
                      input.value = "";
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleProfileUpdate}>
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                />
              </div>
              <Button onClick={handlePasswordChange}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, emailNotifications: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Course Updates</Label>
                  <p className="text-sm text-muted-foreground">Notifications about your courses</p>
                </div>
                <Switch
                  checked={notifications.courseUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, courseUpdates: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Student Messages</Label>
                  <p className="text-sm text-muted-foreground">New messages from students</p>
                </div>
                <Switch
                  checked={notifications.studentMessages}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, studentMessages: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Updates about new features</p>
                </div>
                <Switch
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, marketingEmails: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Weekly performance summaries</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, weeklyReports: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your profile visibility and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to students</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => 
                    setPrivacy({...privacy, profileVisible: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Email</Label>
                  <p className="text-sm text-muted-foreground">Display email on public profile</p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) => 
                    setPrivacy({...privacy, showEmail: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Phone</Label>
                  <p className="text-sm text-muted-foreground">Display phone on public profile</p>
                </div>
                <Switch
                  checked={privacy.showPhone}
                  onCheckedChange={(checked) => 
                    setPrivacy({...privacy, showPhone: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Messages</Label>
                  <p className="text-sm text-muted-foreground">Let students send you direct messages</p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => 
                    setPrivacy({...privacy, allowMessages: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}