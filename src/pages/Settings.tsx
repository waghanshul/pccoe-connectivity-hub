
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/services/user";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { userData, updateUserData, isLoading, syncProfileToDatabase } = useUserStore();
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newInterest, setNewInterest] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [localBio, setLocalBio] = useState(userData.bio || "");
  const [localInterests, setLocalInterests] = useState<string[]>(userData.interests || []);

  useEffect(() => {
    // Update local state when userData changes
    setLocalBio(userData.bio || "");
    setLocalInterests(Array.isArray(userData.interests) ? [...userData.interests] : []);
  }, [userData.bio, userData.interests]);

  useEffect(() => {
    // Check if profile name is empty and user auth data has a name
    if ((!userData.name || userData.name === "Guest User") && user?.user_metadata?.name) {
      console.log("Updating profile with auth metadata name:", user.user_metadata.name);
      updateUserData({ name: user.user_metadata.name });
    }
    
    // Check if department is empty
    if (!userData.department && user?.user_metadata?.branch) {
      console.log("Updating department with auth metadata branch:", user.user_metadata.branch);
      updateUserData({ department: user.user_metadata.branch });
    }
    
    // Check if year is empty
    if (!userData.year && user?.user_metadata?.year) {
      console.log("Updating year with auth metadata year:", user.user_metadata.year);
      updateUserData({ year: user.user_metadata.year });
    }
  }, [userData, user, updateUserData]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Make sure bio is saved
      if (localBio !== userData.bio) {
        await updateUserData({ bio: localBio });
      }
      
      // Make sure interests are saved
      if (JSON.stringify(localInterests) !== JSON.stringify(userData.interests)) {
        await updateUserData({ interests: localInterests });
      }
      
      await syncProfileToDatabase();
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUserData({ avatar: reader.result as string });
        toast.success("Profile photo updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    updateUserData({ [field]: value });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalBio(e.target.value);
  };
  
  // Save bio to database when focus leaves the textarea
  const saveBioToDatabase = async () => {
    try {
      if (localBio !== userData.bio) {
        await updateUserData({ bio: localBio });
        toast.success("Bio updated successfully!");
      }
    } catch (error) {
      console.error("Error updating bio:", error);
      toast.error("Failed to update bio. Please try again.");
      // Reset local bio to the state in userData if save fails
      setLocalBio(userData.bio || "");
    }
  };

  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      // Ensure we don't add duplicate interests
      if (!localInterests.includes(newInterest.trim())) {
        const updatedInterests = [...localInterests, newInterest.trim()];
        setLocalInterests(updatedInterests);
        updateUserData({ interests: updatedInterests })
          .then(() => toast.success("Interest added successfully!"))
          .catch(err => {
            console.error("Error adding interest:", err);
            toast.error("Failed to add interest");
            setLocalInterests([...userData.interests]); // Reset to original on error
          });
      } else {
        toast.error("This interest is already in your list");
      }
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    const updatedInterests = localInterests.filter(
      interest => interest !== interestToRemove
    );
    setLocalInterests(updatedInterests);
    updateUserData({ interests: updatedInterests })
      .then(() => toast.success("Interest removed successfully!"))
      .catch(err => {
        console.error("Error removing interest:", err);
        toast.error("Failed to remove interest");
        setLocalInterests([...userData.interests]); // Reset to original on error
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userData.avatar} />
                    <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="photo" className="cursor-pointer">
                      <div className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                        Change Photo
                      </div>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={userData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department/Branch</Label>
                  <Input 
                    id="department" 
                    value={userData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Enter your department/branch"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={localBio}
                    onChange={handleBioChange}
                    onBlur={saveBioToDatabase}
                    placeholder="Enter a brief bio about yourself"
                    className="min-h-[100px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input 
                    id="year" 
                    value={userData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder="Enter your current year"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(localInterests) && localInterests.length > 0 ? (
                      localInterests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {interest}
                          <button
                            onClick={() => handleRemoveInterest(interest)}
                            className="ml-1 hover:text-destructive"
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No interests added yet</p>
                    )}
                  </div>
                  <Input
                    placeholder="Add new interest (press Enter)"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleAddInterest}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Manage your profile visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Make your profile visible to everyone
                    </p>
                  </div>
                  <Switch
                    checked={userData.isPublic}
                    onCheckedChange={(checked) => updateUserData({ isPublic: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive push notifications
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSaveChanges} 
              className="w-full"
              disabled={isLoading || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
