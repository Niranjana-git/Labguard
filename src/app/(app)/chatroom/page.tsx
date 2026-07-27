
export default function ChatroomPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Chatroom</h1>
          <p className="text-muted-foreground">
            A shared space for collaboration and communication.
          </p>
        </header>
        <div className="flex-1 rounded-lg border overflow-hidden">
            <iframe
                src="https://fbt-jet.vercel.app/"
                className="w-full h-full border-0"
                title="Chatroom"
                allow="microphone"
            />
        </div>
    </div>
  );
}
