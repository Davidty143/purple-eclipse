'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Edit } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import * as LucideIcons from 'lucide-react';
import { isValidElementType } from 'react-is';
import type { LucideProps } from 'lucide-react';

// Define the SubforumData type here to match with the other components
export interface SubforumData {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  deleted: boolean;
  forumId: number;
  created: string;
  modified: string;
}

interface EditSubforumDialogProps {
  subforumId: number;
  currentTitle: string;
  currentDescription: string;
  currentIcon: string | null;
  onSuccess?: (updatedSubforum: SubforumData) => void;
}

type IconType = React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>>;

function isLucideIconComponent(value: any): value is IconType {
  return typeof value === 'function' || (typeof value === 'object' && isValidElementType(value));
}

const rawIconOptions = ['GraduationCap', 'BookOpen', 'PenTool', 'TestTube', 'FlaskConical', 'Calculator', 'Library', 'Atom', 'FunctionSquare', 'FileText', 'Microscope', 'Cpu', 'CircuitBoard', 'BrainCircuit', 'ServerCog', 'Terminal', 'Code', 'HardDrive', 'SatelliteDish', 'CloudLightning', 'Bot', 'Gamepad2', 'Trophy', 'Joystick', 'Rocket', 'Sword', 'Dice5', 'Gem', 'Palette', 'Music2', 'Camera', 'Mic', 'Brush', 'Leaf', 'Bicycle', 'Tent', 'TreePine', 'Heart', 'Droplet', 'Weight', 'Lotus', 'Sun', 'Moon', 'BedDouble', 'MessagesSquare', 'UserPlus', 'Users', 'Megaphone', 'Globe', 'Phone', 'Mail', 'Settings', 'Folder', 'ClipboardList', 'ShieldCheck', 'AlertCircle', 'Flag', 'Lightbulb', 'Zap', 'MapPin', 'Eye', 'Search', 'Calendar', 'Clock', 'File', 'Upload', 'Download'];

const forumIconOptions = rawIconOptions.filter((icon) => icon in LucideIcons);

export function EditSubforumDialog({ subforumId, currentTitle, currentDescription, currentIcon, onSuccess }: EditSubforumDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: currentTitle || '',
    description: currentDescription || '',
    icon: currentIcon || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Subforum title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/subforums/${subforumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subforum_name: formData.title.trim(),
          subforum_description: formData.description.trim(),
          subforum_icon: formData.icon || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subforum');
      }

      const updatedSubforum = await response.json(); // Assuming the response returns the updated subforum

      setOpen(false);
      setFormData({
        title: updatedSubforum.subforum_name,
        description: updatedSubforum.subforum_description,
        icon: updatedSubforum.subforum_icon || ''
      });
      onSuccess?.(updatedSubforum); // Call the onSuccess callback with the updated subforum data
    } catch (err: any) {
      setError(err.message || 'Failed to update subforum');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-white hover:font-semibold hover:bg-white hover:text-[#267858]" aria-label="Edit subforum">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] z-[60]">
        <DialogHeader>
          <DialogTitle>Edit Subforum</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && <p className="text-sm text-destructive p-2 bg-destructive/10 rounded-md">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="subforum-title">Subforum Title *</Label>
            <Input id="subforum-title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter subforum title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subforum-description">Description</Label>
            <Textarea id="subforum-description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this subforum" rows={4} />
          </div>

          <div className="space-y-2">
            <Label>Icon (optional)</Label>
            <Select key={open ? 'open' : 'closed'} onValueChange={(value) => setFormData({ ...formData, icon: value })} value={formData.icon || ''}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {formData.icon &&
                    (() => {
                      const Icon = LucideIcons[formData.icon as keyof typeof LucideIcons];
                      return isLucideIconComponent(Icon) ? <Icon className="w-4 h-4" /> : null;
                    })()}
                  <SelectValue placeholder="Select an icon" />
                </div>
              </SelectTrigger>

              <SelectContent className="max-h-64 overflow-y-auto z-[70]">
                <div className="grid grid-cols-6 gap-2 p-2">
                  {forumIconOptions.map((iconName, index) => {
                    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];
                    if (!isLucideIconComponent(IconComponent)) return null;

                    return (
                      <SelectItem key={`${iconName}-${index}`} value={iconName} className="flex items-center justify-center p-2 rounded-md hover:bg-accent focus:bg-accent">
                        <IconComponent className="w-5 h-5" />
                      </SelectItem>
                    );
                  })}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
