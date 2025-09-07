import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit3 } from "lucide-react";

interface NotesModalProps {
  note: string;
  onNoteChange: (note: string) => void;
}

const NotesModal = ({ note, onNoteChange }: NotesModalProps) => {
  const [tempNote, setTempNote] = useState(note);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onNoteChange(tempNote);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempNote(note);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit3 className="h-3 w-3" />
          {note ? 'Edit Notes' : 'Add Notes'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Additional Notes</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="modal-notes" className="text-sm font-medium">
            Add context or observations
          </Label>
          <Textarea
            id="modal-notes"
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            placeholder="Optional: Add any additional context..."
            className="min-h-24"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;