export function AuthHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em] text-foreground">{title}</h1>
      <p className="text-body text-muted-foreground">{description}</p>
    </div>
  );
}
