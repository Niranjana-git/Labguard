import { UsersTable } from "./components/users-table";

export default function UsersPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage technicians and teachers. Assign them to clusters.
          </p>
        </header>
        <main className="grid flex-1 items-start gap-4">
          <UsersTable />
        </main>
      </div>
    </div>
  );
}
