'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

import * as LucideIcons from 'lucide-react';
import { isValidElementType } from 'react-is';
import type { LucideProps } from 'lucide-react';

interface CreateSubforumDialogProps {
  children?: React.ReactNode;
  parentId: number;
  parentName: string;
  onSuccess?: () => void;
}

type IconType = React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>>;

function isLucideIconComponent(value: any): value is IconType {
  return typeof value === 'function' || (typeof value === 'object' && isValidElementType(value));
}

export function CreateSubforumDialog({ children, parentId, parentName, onSuccess }: CreateSubforumDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rawIconOptions = ['GraduationCap', 'BookOpen', 'PenTool', 'TestTube', 'FlaskConical', 'Calculator', 'Library', 'Atom', 'FunctionSquare', 'FileText', 'Microscope', 'Cpu', 'CircuitBoard', 'BrainCircuit', 'ServerCog', 'Terminal', 'Code', 'HardDrive', 'SatelliteDish', 'CloudLightning', 'Bot', 'Gamepad2', 'Trophy', 'Joystick', 'Rocket', 'Sword', 'Dice5', 'Gem', 'Palette', 'Music2', 'Camera', 'Mic', 'Brush', 'Leaf', 'Bicycle', 'Tent', 'TreePine', 'Heart', 'Droplet', 'Weight', 'Lotus', 'Sun', 'Moon', 'BedDouble', 'MessagesSquare', 'UserPlus', 'Users', 'Megaphone', 'Globe', 'Phone', 'Mail', 'Settings', 'Folder', 'ClipboardList', 'ShieldCheck', 'AlertCircle', 'Flag', 'Lightbulb', 'Zap', 'MapPin', 'Eye', 'Search', 'Calendar', 'Clock', 'File', 'Upload', 'Download'];

  const forumIconOptions = rawIconOptions.filter((icon) => icon in LucideIcons);

  const handleClose = () => {
    setFormData({ name: '', description: '', icon: '' });
    setError('');
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Subforum name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/get-subforums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subforum_name: formData.name.trim(),
          subforum_description: formData.description.trim(),
          forum_id: parentId,
          icon: formData.icon || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subforum');
      }

      handleClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create subforum');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else setOpen(true);
      }}>
      <DialogTrigger asChild>{children || <Button variant="default">Create Subforum</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] z-[60]">
        <DialogHeader>
          <DialogTitle>Create Subforum in {parentName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Parent Forum */}
          <div className="space-y-2">
            <Label>Parent Forum</Label>
            <div className="flex items-center p-3 border rounded-md bg-muted">
              <span className="font-medium">{parentName}</span>
            </div>
          </div>

          {/* Subforum Name */}
          <div className="space-y-2">
            <Label>Subforum Name *</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter subforum name" required disabled={isSubmitting} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this subforum" rows={3} disabled={isSubmitting} />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label>Icon (optional)</Label>
            <Select key={open ? 'open' : 'closed'} onValueChange={(value) => setFormData({ ...formData, icon: value })} value={formData.icon}>
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Subforum'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
