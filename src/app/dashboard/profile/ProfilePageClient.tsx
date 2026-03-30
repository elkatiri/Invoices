'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, User } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import type { Profile } from '@/lib/types';
import Image from 'next/image';

export default function ProfilePageClient({
  profile,
}: {
  profile: Profile;
}) {
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [companyName, setCompanyName] = useState(profile.company_name ?? '');
  const [address, setAddress] = useState(profile.address ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [logoUrl, setLogoUrl] = useState(profile.logo_url ?? '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPEG, WebP, and SVG files are allowed');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploading(true);

    const ext = file.name.split('.').pop();
    const filePath = `${profile.id}/logo.${ext}`;

    // Remove old logo if exists
    if (logoUrl) {
      const oldPath = logoUrl.split('/logos/')[1];
      if (oldPath) {
        await supabase.storage.from('logos').remove([oldPath]);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('logos').getPublicUrl(filePath);

    // Update profile with new logo URL
    await supabase
      .from('profiles')
      .update({ logo_url: publicUrl })
      .eq('id', profile.id);

    setLogoUrl(publicUrl);
    setUploading(false);
    toast.success('Logo uploaded');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        company_name: companyName || null,
        address: address || null,
        phone: phone || null,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Profile updated');
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-dark-800 dark:text-light-50">
          Profile
        </h1>
        <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
          Your business information appears on invoices
        </p>
      </div>

      {/* Logo Upload */}
      <Card>
        <h2 className="text-lg font-semibold text-dark-800 dark:text-light-50 mb-4">
          Company Logo
        </h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-light-200 dark:border-dark-700 flex items-center justify-center overflow-hidden bg-light-50 dark:bg-dark-900">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo"
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            ) : (
              <User size={32} className="text-light-300 dark:text-dark-700" />
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            >
              <Upload size={14} />
              {logoUrl ? 'Replace Logo' : 'Upload Logo'}
            </Button>
            <p className="text-xs text-dark-700 dark:text-light-300 mt-2">
              PNG, JPEG, WebP, or SVG. Max 2MB.
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card>
        <h2 className="text-lg font-semibold text-dark-800 dark:text-light-50 mb-4">
          Business Details
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            value={profile.email}
            disabled
            className="opacity-60"
          />
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
          <Input
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Inc."
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 890"
          />
          <TextArea
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, State, ZIP"
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
