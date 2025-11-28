import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMembers,
  createMember,
  updateMember,
  deleteMember,
  clearError,
} from "@/store/slices/membersSlice";
import { Member } from "@/data/members";
import { MemberList } from "@/components/members/MemberList";
import { MemberDetails } from "@/components/members/MemberDetails";
import { MemberForm } from "@/components/members/MemberForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Members = () => {
  const dispatch = useAppDispatch();
  const { members, loading, error } = useAppSelector((state) => state.members);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

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

  const handleAddMember = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsDetailsOpen(true);
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      await dispatch(deleteMember(id));
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
    }
  };

  const handleFormSubmit = async (data: Omit<Member, "id">) => {
    if (editingMember) {
      await dispatch(updateMember({ id: editingMember.id, data }));
      toast({
        title: "Success",
        description: "Member updated successfully",
      });
    } else {
      await dispatch(createMember(data));
      toast({
        title: "Success",
        description: "Member added successfully",
      });
    }
    setIsFormOpen(false);
    setEditingMember(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Members</h1>
          <p className="text-muted-foreground">Manage library members</p>
        </div>
        <Button onClick={handleAddMember}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <MemberList
        members={members}
        onView={handleViewMember}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
        loading={loading}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            member={editingMember || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && <MemberDetails member={selectedMember} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
