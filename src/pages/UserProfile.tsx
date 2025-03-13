
import { Navigation } from "@/components/Navigation";
import { UserProfile as UserProfileComponent } from "@/components/UserProfile";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserStatus } from "@/services/user";
import { useAuth } from "@/context/AuthContext";

interface ProfileData {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  year: string;
  bio: string;
  interests: string[];
  isPublic: boolean;
  email: string;
  phone: string;
  status: UserStatus;
}

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id: string) => {
    try {
      setIsLoading(true);

      // Fetch base profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Determine role and fetch extended data
      let extendedData = {};
      if (profileData.role === 'student') {
        const { data: studentData, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (studentError) throw studentError;
        extendedData = studentData;
      } else if (profileData.role === 'admin') {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (adminError) throw adminError;
        extendedData = adminData;
      }

      // Combine and set the data
      setUserData({
        id: profileData.id,
        name: profileData.full_name,
        avatar: profileData.avatar_url || "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80",
        role: profileData.role,
        department: extendedData.department || '',
        year: extendedData.year || '',
        bio: extendedData.bio || '',
        interests: extendedData.interests || [],
        isPublic: true,
        email: profileData.email,
        phone: '',
        status: profileData.status as UserStatus || 'offline',
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 text-center">
          <h2 className="text-2xl font-bold dark:text-white">User not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="relative">
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary to-blue-600 dark:from-primary/80 dark:to-blue-600/80 rounded-b-3xl -z-10" />
          <UserProfileComponent 
            user={userData} 
            isOwnProfile={user?.id === userData.id}
          />
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
