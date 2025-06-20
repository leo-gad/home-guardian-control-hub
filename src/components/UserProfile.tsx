
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Upload, Camera } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || '');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileImage(result);
      if (currentUser) {
        updateUser(currentUser.id, { profileImage: result });
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage} alt={currentUser.name} />
                <AvatarFallback className="bg-gray-700 text-gray-200 text-lg">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <Label htmlFor="profile-upload" className="cursor-pointer">
                  <div className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </Label>
                <Input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            {uploading && (
              <p className="text-gray-400 text-sm">Uploading image...</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-200">Name</Label>
              <Input
                value={currentUser.name}
                readOnly
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-gray-200">Email</Label>
              <Input
                value={currentUser.email}
                readOnly
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-gray-200">Role</Label>
              <div className="mt-2">
                <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
                  {currentUser.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
