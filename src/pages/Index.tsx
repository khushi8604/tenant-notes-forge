import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Update document title for preview
    document.title = "Tenant Notes Forge - Multi-Tenant SaaS Notes App";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-2xl px-4">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Tenant Notes Forge</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Multi-Tenant SaaS Notes Application
        </p>
        <p className="text-muted-foreground">
          Connect to Supabase to enable authentication, database, and backend functionality
        </p>
      </div>
    </div>
  );
};

export default Index;
