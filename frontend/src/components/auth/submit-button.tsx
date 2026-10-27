import { Loader2 } from "lucide-react";

export function SubmitButton({
  loading,
  loadingText,
  children,
}: {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-sidebar focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
      {loading ? loadingText : children}
    </button>
  );
}
