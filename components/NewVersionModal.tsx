'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface NewVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    content: string;
    description: string;
    commitMessage: string;
    tags: string[];
  }) => Promise<void>;
  currentContent: string;
  currentTags?: string[];
}

export function NewVersionModal({
  isOpen,
  onClose,
  onSubmit,
  currentContent,
  currentTags = [],
}: NewVersionModalProps) {
  const [content, setContent] = useState(currentContent);
  const [description, setDescription] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [tags, setTags] = useState<string[]>(currentTags);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommitStep, setShowCommitStep] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCommitStep(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        content,
        description,
        commitMessage,
        tags,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create new version:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
          <DialogDescription>
            {showCommitStep
              ? 'Add a commit message to describe your changes'
              : 'Create a new version of your prompt'}
          </DialogDescription>
        </DialogHeader>

        {!showCommitStep ? (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What changed in this version?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Next</Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="commitMessage">Commit Message</Label>
              <Textarea
                id="commitMessage"
                placeholder="Describe the changes in detail"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCommitStep(false)}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Version'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 