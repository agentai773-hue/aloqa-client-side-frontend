import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  className?: string;
  text?: string;
}

export default function Loader({ size = 24, className = "", text }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`animate-spin text-blue-600 ${className}`} size={size} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Loader size={48} text={text} />
    </div>
  );
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader size={32} text={text} />
    </div>
  );
}
