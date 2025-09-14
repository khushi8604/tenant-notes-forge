import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Pin, PinOff, Edit, Trash2, MoreVertical, StickyNote, Search } from "lucide-react";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotes";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface NotesSectionProps {
  tenantId: string;
  tenantName: string;
}

export function NotesSection({ tenantId, tenantName }: NotesSectionProps) {
  const { data: notes, isLoading } = useNotes(tenantId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { toast } = useToast();
  
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    try {
      await createNote.mutateAsync({ title, content, tenantId });
      setIsCreateNoteOpen(false);
      toast({
        title: "Note created!",
        description: "Your note has been created successfully.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Error creating note",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingNote) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    try {
      await updateNote.mutateAsync({ 
        id: editingNote.id, 
        title, 
        content, 
        tenantId 
      });
      setEditingNote(null);
      toast({
        title: "Note updated!",
        description: "Your note has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating note",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (note: any) => {
    try {
      await updateNote.mutateAsync({
        id: note.id,
        isPinned: !note.is_pinned,
        tenantId,
      });
      toast({
        title: note.is_pinned ? "Note unpinned" : "Note pinned",
        description: `Note has been ${note.is_pinned ? 'unpinned' : 'pinned'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating note",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (note: any) => {
    try {
      await deleteNote.mutateAsync({ id: note.id, tenantId });
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredNotes = notes?.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
  const regularNotes = filteredNotes.filter(note => !note.is_pinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {tenantName} Notes
          </h2>
          <p className="text-muted-foreground">
            Manage your team's notes and documentation
          </p>
        </div>
        
        <Dialog open={isCreateNoteOpen} onOpenChange={setIsCreateNoteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Add a new note to your workspace.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-title">Title</Label>
                <Input
                  id="create-title"
                  name="title"
                  placeholder="Enter note title..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-content">Content</Label>
                <Textarea
                  id="create-content"
                  name="content"
                  placeholder="Write your note content here..."
                  rows={10}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateNoteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createNote.isPending}>
                  {createNote.isPending ? "Creating..." : "Create Note"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading notes...</div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              No notes yet
            </CardTitle>
            <CardDescription>
              {searchQuery ? "No notes found matching your search." : "Get started by creating your first note."}
            </CardDescription>
          </CardHeader>
          {!searchQuery && (
            <CardContent>
              <Dialog open={isCreateNoteOpen} onOpenChange={setIsCreateNoteOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Note
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned Notes
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={setEditingNote}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes */}
          {regularNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h3 className="text-lg font-semibold mb-4">All Notes</h3>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={setEditingNote}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Make changes to your note.
            </DialogDescription>
          </DialogHeader>
          {editingNote && (
            <form onSubmit={handleUpdateNote} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingNote.title}
                  placeholder="Enter note title..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  name="content"
                  defaultValue={editingNote.content || ""}
                  placeholder="Write your note content here..."
                  rows={10}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateNote.isPending}>
                  {updateNote.isPending ? "Updating..." : "Update Note"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoteCard({ 
  note, 
  onEdit, 
  onTogglePin, 
  onDelete 
}: { 
  note: any; 
  onEdit: (note: any) => void;
  onTogglePin: (note: any) => void;
  onDelete: (note: any) => void;
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">{note.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {note.is_pinned && (
                <Badge variant="secondary" className="text-xs">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                by {note.profiles?.full_name || 'Unknown'}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(note)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTogglePin(note)}>
                {note.is_pinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(note)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      {note.content && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {note.content}
          </p>
        </CardContent>
      )}
      
      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
}