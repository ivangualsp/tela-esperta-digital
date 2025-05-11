
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-gray-300 bg-white min-h-[300px]">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      {(actionLabel && actionLink) && (
        <Link to={actionLink}>
          <Button variant="default">{actionLabel}</Button>
        </Link>
      )}
      {(actionLabel && onAction) && (
        <Button variant="default" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
