import { cn } from "../lib/utils";

export function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, className, ...props }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-secondary text-sm font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
