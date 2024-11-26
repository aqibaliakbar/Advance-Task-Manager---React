import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  Laptop,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import {
  useCreateTeamMutation,
  useAddTeamMemberMutation,
  useGetTeamsQuery,
} from "@/store/services/api";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/store/services/features/userSlice";

const TeamDialog = ({ onClose }) => {
  const { session } = useSelector((state) => state.user);
  const user = session?.user;
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([
    { email: user?.email, isOwner: true },
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [createTeam] = useCreateTeamMutation();
  const [addTeamMember] = useAddTeamMemberMutation();

  const handleAddMember = () => {
    if (!newMemberEmail) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (teamMembers.some((member) => member.email === newMemberEmail)) {
      toast.error("Member already added");
      return;
    }

    setTeamMembers([...teamMembers, { email: newMemberEmail, isOwner: false }]);
    setNewMemberEmail("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddMember();
    }
  };

  const handleRemoveMember = (email) => {
    if (email === user?.email) {
      toast.error("Cannot remove team owner");
      return;
    }
    setTeamMembers(teamMembers.filter((member) => member.email !== email));
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    if (teamMembers.length === 0) {
      toast.error("At least one team member is required");
      return;
    }

    setIsLoading(true);
    try {
      // First create the team
      const teamResult = await createTeam({
        name: teamName.trim(),
        created_by: user?.id,
        created_at: new Date().toISOString(),
      }).unwrap();

      const teamId = teamResult[0].id;

      // Add members sequentially
      for (const member of teamMembers) {
        try {
          await addTeamMember({
            team_id: teamId,
            email: member.email,
            user_id: member.userId, // Use the stored userId
            created_at: new Date().toISOString(),
          }).unwrap();
        } catch (memberError) {
          console.error("Error adding member:", memberError);
          toast.error(`Failed to add member: ${member.email}`);
        }
      }

      toast.success("Team created successfully");
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error(error?.message || "Failed to create team");
      setIsLoading(false);
    }
  };
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Create New Team</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div>
          <Input
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Team Members</div>
          {teamMembers.map((member) => (
            <div
              key={member.email}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{member.email}</span>
                {member.isOwner && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Owner
                  </span>
                )}
              </div>
              {!member.isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.email)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Add member by email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleAddMember}>Add</Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline" disabled={isLoading}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          onClick={handleCreateTeam}
          disabled={isLoading || !teamName.trim() || teamMembers.length === 0}
        >
          {isLoading ? "Creating..." : "Create Team"}
        </Button>
      </div>
    </DialogContent>
  );
};

const Header = ({ toggleSidebar }) => {
  const { session } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = session?.user;
  const [searchTerm, setSearchTerm] = useState("");
  const { data: teams = [] } = useGetTeamsQuery();
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

  // Get current team from URL or localStorage
  const [currentTeam, setCurrentTeam] = useState(() => {
    const savedTeam = localStorage.getItem("currentTeam");
    return savedTeam ? JSON.parse(savedTeam) : teams[0];
  });

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTeamChange = (team) => {
    setCurrentTeam(team);
    localStorage.setItem("currentTeam", JSON.stringify(team));
  };

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Failed to sign out");
    }
  };
  return (
    <header className="h-14 border-b bg-white flex items-center px-4 justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>{currentTeam?.name || "Select Team"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <div className="p-2">
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            {filteredTeams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleTeamChange(team)}
              >
                <div className="flex items-center">
                  <span>{team.name}</span>
                  {team.team_members?.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({team.team_members.length} members)
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start pl-2">
                  <Plus className="mr-2 h-4 w-4" />
                  New Team
                </Button>
              </DialogTrigger>
              <TeamDialog onClose={() => setIsTeamDialogOpen(false)} />
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 max-w-xl px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search..." className="pl-10" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Laptop className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <p className="font-medium">{user?.user_metadata?.full_name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
