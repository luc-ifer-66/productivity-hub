import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { offlineStorage } from '@/lib/db';
import { useOffline } from '@/hooks/useOffline';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  Save 
} from 'lucide-react';

interface NoteEditorProps {
  note?: any;
  onNoteUpdate?: (note: any) => void;
}

export function NoteEditor({ note, onNoteUpdate }: NoteEditorProps) {
  const { toast } = useToast();
  const { isOffline } = useOffline();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectId, setProjectId] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !isOffline,
  });

  const { data: linkedTasks = [] } = useQuery({
    queryKey: ['/api/task-note-links', note?.id],
    enabled: !isOffline && !!note?.id,
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setProjectId(note.projectId || '');
      setHasChanges(false);
    }
  }, [note]);

  const updateNoteMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!note?.id) return;

      if (isOffline) {
        return await offlineStorage.updateNote(note.id, updates);
      } else {
        const response = await apiRequest('PUT', `/api/notes/${note.id}`, updates);
        return await response.json();
      }
    },
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setHasChanges(false);
      onNoteUpdate?.(updatedNote);
      toast({
        title: 'Success',
        description: 'Note saved successfully',
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    if (!note?.id || !hasChanges) return;
    
    updateNoteMutation.mutate({
      title,
      content,
      projectId: projectId || null,
    });
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(true);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    setHasChanges(true);
  };

  const formatToolbarButton = (action: string) => {
    // Simple text formatting for textarea
    const textarea = document.querySelector('[data-testid="textarea-note-content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newContent = content;

    switch (action) {
      case 'bold':
        newContent = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        break;
      case 'italic':
        newContent = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
        break;
      case 'heading':
        newContent = content.substring(0, start) + `## ${selectedText}` + content.substring(end);
        break;
      case 'list':
        newContent = content.substring(0, start) + `- ${selectedText}` + content.substring(end);
        break;
      case 'ordered-list':
        newContent = content.substring(0, start) + `1. ${selectedText}` + content.substring(end);
        break;
      case 'link':
        newContent = content.substring(0, start) + `[${selectedText}](url)` + content.substring(end);
        break;
      case 'code':
        newContent = content.substring(0, start) + `\`${selectedText}\`` + content.substring(end);
        break;
    }

    setContent(newContent);
    setHasChanges(true);
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project?.name || 'No Project';
  };

  if (!note) {
    return (
      <div className="bg-card rounded-lg border border-border h-96 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-card-foreground mb-2">No Note Selected</h3>
          <p className="text-muted-foreground">Select a note from the sidebar or create a new one to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border h-full">
      {/* Editor Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl font-bold bg-transparent border-none outline-none text-card-foreground placeholder-muted-foreground flex-1 p-0 focus-visible:ring-0"
            placeholder="Note title..."
            data-testid="input-note-title"
          />
          <div className="flex items-center gap-2">
            <Select value={projectId} onValueChange={handleProjectChange}>
              <SelectTrigger className="w-40" data-testid="select-note-project">
                <SelectValue placeholder="No Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Project</SelectItem>
                {projects.map((project: any) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              disabled={!hasChanges || updateNoteMutation.isPending}
              data-testid="button-save-note"
            >
              <Save className="w-4 h-4 mr-1" />
              {updateNoteMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatToolbarButton('bold')}
            className="p-2 hover:bg-muted/50"
            data-testid="button-format-bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatToolbarButton('italic')}
            className="p-2 hover:bg-muted/50"
            data-testid="button-format-italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatToolbarButton('heading')}
            className="p-2 hover:bg-muted/50"
            data-testid="button-format-heading"
          >
            <Heading className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatToolbarButton('list')}
            className="p-2 hover:bg-muted/50"
            data-testid="button-format-list"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatToolbarButton('ordered-list')}
            className="p-2 hover:bg-muted/50"
            data-testid="button-format-ordered-list"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatToolbarButton('link')}
            className="p-2 hover:bg-muted/50"
            data-testid="button-format-link"
          >
            <Link className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatToolbarButton('code')}
            className="p-2 hover:bg-muted/50"
            data-testid="button-format-code"
          >
            <Code className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="p-6">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your note..."
          className="min-h-96 resize-none bg-transparent border-none focus-visible:ring-0 text-card-foreground"
          data-testid="textarea-note-content"
        />
      </div>
      
      {/* Linked Tasks */}
      {linkedTasks.length > 0 && (
        <div className="p-6 border-t border-border">
          <h4 className="text-sm font-medium text-card-foreground mb-3">Linked Tasks</h4>
          <div className="space-y-2">
            {linkedTasks.map((link: any) => (
              <div key={link.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded border border-border">
                <input 
                  type="checkbox" 
                  className="rounded border-border bg-input text-primary focus:ring-primary focus:ring-offset-0"
                  data-testid={`checkbox-linked-task-${link.taskId}`}
                />
                <span className="text-sm text-card-foreground flex-1">
                  {link.task?.title || 'Untitled Task'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {link.task?.priority || 'medium'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Note Metadata */}
      <div className="p-6 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Project: {getProjectName(projectId)}</span>
          <span>
            Last updated: {new Date(note.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
