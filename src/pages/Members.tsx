import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // Redux hooks
import {
  fetchMembers,
  createMember,
  updateMember,
  deleteMember,
  clearError,
} from "@/store/slices/membersSlice"; // Redux slice actions
import { Member } from "@/data/members"; // Member type
import { MemberList } from "@/components/members/MemberList"; // Table/list component
import { MemberDetails } from "@/components/members/MemberDetails"; // Details modal
import { MemberForm } from "@/components/members/MemberForm"; // Add/Edit form
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Dialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react"; // Icon
import { toast } from "@/hooks/use-toast"; // Toast notifications

const Members = () => {
  const dispatch = useAppDispatch();
  const { members, loading, error } = useAppSelector((state) => state.members);
  // members: array of all members
  // loading: true while fetching
  // error: error message if any

  // Local UI state
  const [isFormOpen, setIsFormOpen] = useState(false); // Add/Edit form modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // Member details modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null); // For details view
  const [editingMember, setEditingMember] = useState<Member | null>(null); // For editing existing member

  // AlertDialog state for deletion
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  // Fetch members on component mount
  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  // Show toast on error and clear it from Redux
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Open Add Member form
  const handleAddMember = () => {
    setEditingMember(null); // Ensure form is empty
    setIsFormOpen(true);
  };

  // Open Edit Member form
  const handleEditMember = (member: Member) => {
    setEditingMember(member); // Pre-fill form with member data
    setIsFormOpen(true);
  };

  // Open Member Details modal
  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsDetailsOpen(true);
  };

  // Delete a member with confirmation
  const handleDeleteMember = (id: string) => {
    setMemberToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await dispatch(deleteMember(memberToDelete));
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  // Handle form submission for Add/Edit
  const handleFormSubmit = async (data: Omit<Member, "id">) => {
    if (editingMember) {
      // Update existing member
      await dispatch(updateMember({ id: editingMember.id, data }));
      toast({
        title: "Success",
        description: "Member updated successfully",
      });
    } else {
      // Create new member
      await dispatch(createMember(data));
      toast({
        title: "Success",
        description: "Member added successfully",
      });
    }
    // Close form modal and reset editing state
    setIsFormOpen(false);
    setEditingMember(null);
  };

  // Cancel form without saving
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with title and Add Member button */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-extrabold text-foreground tracking-tighter mb-2">Member <span className="text-primary italic">Directory</span></h1>
          <p className="text-lg text-muted-foreground/60">Manage library memberships and community access.</p>
        </div>
        <Button onClick={handleAddMember} className="rounded-2xl px-6 h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Add Member
        </Button>
      </div>

      {/* Members table/list */}
      <MemberList
        members={members}
        onView={handleViewMember} // Open details modal
        onEdit={handleEditMember} // Open edit form
        onDelete={handleDeleteMember} // Delete member
        loading={loading} // Show loading state
      />

      {/* Add/Edit Member Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            member={editingMember || undefined} // Pass editing member or undefined
            onSubmit={handleFormSubmit} // Submit handler
            onCancel={handleFormCancel} // Cancel handler
          />
        </DialogContent>
      </Dialog>

      {/* Member Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && <MemberDetails member={selectedMember} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the member
              and their history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Members;
