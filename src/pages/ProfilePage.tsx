import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Upload, Pencil } from "lucide-react";

type ProfileDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  bio?: string;
  socialLink?: string[];
  skill?: string[];
};

export default function ProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const mapUserProfileToProfileDto = (p: any): ProfileDto => {
    return {
      id: p?.id || "",
      firstName: p?.firstName || "",
      lastName: p?.lastName || "",
      email: p?.email || "",
      profileImageUrl: p?.profilePhoto_url || p?.profileImageUrl,
      bio: p?.bio || "",
      socialLink: p?.socialLinks || p?.socialLink || [],
      skill: p?.skills || p?.skill || [],
    };
  };

  const { data: profile, isLoading, isError, error, refetch } = useQuery<ProfileDto>({
    queryKey: ["profile"],
    queryFn: async () => {
      const raw = await api.getUserProfile();
      return mapUserProfileToProfileDto(raw);
    },
    staleTime: 30_000,
  });

  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSocial, setNewSocial] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", retryPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [requestingTeacher, setRequestingTeacher] = useState(false);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setSocialLinks(profile.socialLink || []);
      setSkills(profile.skill || []);
    }
  }, [profile]);

  const handleAddSocial = () => {
    if (!newSocial.trim()) return;
    setSocialLinks((prev) => [...prev, newSocial.trim()]);
    setNewSocial("");
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setSkills((prev) => [...prev, newSkill.trim()]);
    setNewSkill("");
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await api.updateUserProfile({ bio, socialLink: socialLinks, skill: skills });
      // Immediately fetch updated profile and update local/cache state
      const updatedRaw = await api.getUserProfile();
      const updated = mapUserProfileToProfileDto(updatedRaw);
      queryClient.setQueryData(["profile"], updated);
      setBio(updated.bio || "");
      setSocialLinks(updated.socialLink || []);
      setSkills(updated.skill || []);
      toast({ title: "Profile updated" });
    } catch (e: any) {
      toast({ title: "Failed to update profile", description: e?.message, variant: "destructive" as any });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwd.newPassword !== pwd.retryPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" as any });
      return;
    }
    try {
      setSavingPassword(true);
      await api.changeUserPassword(pwd);
      toast({ title: "Password changed" });
      setPwd({ currentPassword: "", newPassword: "", retryPassword: "" });
    } catch (e: any) {
      toast({ title: "Failed to change password", description: e?.message, variant: "destructive" as any });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    try {
      await api.uploadUserPhoto(file);
      const updatedRaw = await api.getUserProfile();
      const updated = mapUserProfileToProfileDto(updatedRaw);
      queryClient.setQueryData(["profile"], updated);
      toast({ title: "Profile photo updated" });
    } catch (e: any) {
      toast({ title: "Failed to upload photo", description: e?.message, variant: "destructive" as any });
    }
  };

  const handleRequestTeacher = async () => {
    try {
      setRequestingTeacher(true);
      await api.requestToBecomeTeacher();
      toast({ title: "Request sent", description: "We will review your request shortly." });
    } catch (e: any) {
      toast({ title: "Failed to send request", description: e?.message, variant: "destructive" as any });
    } finally {
      setRequestingTeacher(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 md:px-8 py-6 md:py-10">
      {isLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="text-destructive">{(error as any)?.message || "Failed to load profile"}</div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.profileImageUrl} alt={profile?.firstName} />
                    <AvatarFallback>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUploadPhoto(e.target.files[0])} />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{profile?.firstName} {profile?.lastName}</div>
                  <div className="text-muted-foreground">{profile?.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your bio, social links, and skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about yourself" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Social Links</Label>
                  <div className="flex gap-2">
                    <Input value={newSocial} onChange={(e) => setNewSocial(e.target.value)} placeholder="Add link (https://...)" />
                    <Button type="button" onClick={handleAddSocial}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {socialLinks.map((link, idx) => (
                      <Badge key={`${link}-${idx}`} variant="secondary" className="px-3 py-1">
                        <a href={link} target="_blank" rel="noreferrer" className="hover:underline mr-2">{link}</a>
                        <button onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill" />
                    <Button type="button" onClick={handleAddSkill}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((s, idx) => (
                      <Badge key={`${s}-${idx}`} className="px-3 py-1">
                        {s}
                        <button className="ml-2" onClick={() => setSkills(skills.filter((_, i) => i !== idx))}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setBio(profile?.bio || ""); setSocialLinks(profile?.socialLink || []); setSkills(profile?.skill || []); }}>Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={savingProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Retry Password</Label>
                  <Input type="password" value={pwd.retryPassword} onChange={(e) => setPwd({ ...pwd, retryPassword: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPwd({ currentPassword: "", newPassword: "", retryPassword: "" })}>Cancel</Button>
                <Button onClick={handleChangePassword} disabled={savingPassword}>Change Password</Button>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Request */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Request to Become Teacher</CardTitle>
              <CardDescription>Ask for teacher status to create and manage courses</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">You can request access to teacher tools.</div>
              <Button onClick={handleRequestTeacher} disabled={requestingTeacher}>Request to Become Teacher</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


