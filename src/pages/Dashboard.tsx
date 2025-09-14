import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Users, LogOut, Settings, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenants, useCreateTenant } from "@/hooks/useTenants";
import { useToast } from "@/hooks/use-toast";
import { NotesSection } from "@/components/NotesSection";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: tenants, isLoading } = useTenants();
  const createTenant = useCreateTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (tenants && tenants.length > 0 && !selectedTenantId) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [tenants, selectedTenantId]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    try {
      await createTenant.mutateAsync({ name, slug });
      setIsCreateTenantOpen(false);
      toast({
        title: "Tenant created!",
        description: `${name} has been created successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error creating tenant",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const selectedTenant = tenants?.find(t => t.id === selectedTenantId);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Tenant Notes Forge</h1>
              </div>
              
              {tenants && tenants.length > 0 && (
                <Select value={selectedTenantId || ""} onValueChange={setSelectedTenantId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {tenant.name}
                          <Badge variant={tenant.tenant_members[0]?.role === 'owner' ? 'default' : 'secondary'}>
                            {tenant.tenant_members[0]?.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isCreateTenantOpen} onOpenChange={setIsCreateTenantOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Workspace
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>
                      Create a new workspace for your team to collaborate on notes.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTenant} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Workspace Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="My Team Workspace"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Workspace Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        placeholder="my-team"
                        pattern="[a-z0-9-]+"
                        title="Only lowercase letters, numbers, and hyphens allowed"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateTenantOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTenant.isPending}>
                        {createTenant.isPending ? "Creating..." : "Create Workspace"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Team
              </Button>
              
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : !tenants || tenants.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Tenant Notes Forge!</CardTitle>
              <CardDescription>
                Get started by creating your first workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isCreateTenantOpen} onOpenChange={setIsCreateTenantOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Workspace
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>
                      Create a new workspace for your team to collaborate on notes.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTenant} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Workspace Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="My Team Workspace"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Workspace Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        placeholder="my-team"
                        pattern="[a-z0-9-]+"
                        title="Only lowercase letters, numbers, and hyphens allowed"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateTenantOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTenant.isPending}>
                        {createTenant.isPending ? "Creating..." : "Create Workspace"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : selectedTenant ? (
          <NotesSection tenantId={selectedTenantId!} tenantName={selectedTenant.name} />
        ) : null}
      </main>
    </div>
  );
};

export default Dashboard;