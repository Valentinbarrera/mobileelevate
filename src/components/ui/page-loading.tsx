import LoadingSpinner from "./loading-spinner";

interface PageLoadingProps {
  message?: string;
}

const PageLoading = ({ message }: PageLoadingProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export default PageLoading;
