import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { offlineStorage } from '@/lib/db';
import { useOffline } from '@/hooks/useOffline';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';

interface NotesListProps {
  selectedNoteId?: string;
  onNoteSelect: (note: any) => void;
  onCreateNote: () => void;
}

export function NotesList({ selectedNoteId, onNoteSelect, onCreateNote }: NotesListProps) {
  const { toast } = useToast();
  const { isOffline } = useOffline();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['/api/notes'],
    enabled: !isOffline,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !isOffline,
  });

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      const noteData = {
        id: crypto.randomUUID(),
        title: 'Untitled Note',
        content: '',
        projectId: selectedProject || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isOffline) {
        return await offlineStorage.createNote(noteData);
      } else {
        const response = await apiRequest('POST', '/api/notes', {
          title: noteData.title,
          content: noteData.content,
          projectId: noteData.projectId,
        });
        return await response.json();
      }
    },
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      onNoteSelect(newNote);
      toast({
        title: 'Success',
        description: 'Note created successfully',
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
        description: 'Failed to create note',
        variant: 'destructive',
      });
    },
  });

  const filteredNotes = notes.filter((note: any) => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !selectedProject || note.projectId === selectedProject;
    return matchesSearch && matchesProject;
  });

  const handleCreateNote = () => {
    createNoteMutation.mutate();
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project?.name || 'No Project';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPreview = (content: string) => {
    if (!content) return 'No content...';
    return content.replace(/<[^>]*>/g, '').substring(0, 100) + (content.length > 100 ? '...' : '');
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/30 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">Notes</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCreateNote}
          disabled={createNoteMutation.isPending}
          data-testid="button-create-note"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-note-search"
        />
      </div>
      
      <div className="mb-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger data-testid="select-note-filter-project">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Projects</SelectItem>
            {projects.map((project: any) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-notes">
            {searchTerm || selectedProject ? 'No notes match your filters' : 'No notes yet. Create your first note!'}
          </div>
        ) : (
          filteredNotes.map((note: any) => (
            <div
              key={note.id}
              onClick={() => onNoteSelect(note)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedNoteId === note.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/30 hover:border-primary/50'
              }`}
              data-testid={`note-item-${note.id}`}
            >
              <h3 className="font-medium text-card-foreground text-sm mb-1">
                {note.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                {getPreview(note.content || '')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary">
                  {getProjectName(note.projectId)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(note.updatedAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
