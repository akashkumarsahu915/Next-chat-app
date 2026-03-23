import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MessageSquare className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Welcome to NexChat</h2>
      <p className="text-muted-foreground max-w-xs mx-auto">
        Select a conversation from the sidebar to start chatting or find new friends in the explore tab.
      </p>
    </div>
  );
}
