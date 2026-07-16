export function ImageCaption({
  caption,
  credit,
}: {
  caption?: string;
  credit?: string;
}) {
  if (!caption && !credit) return null;
  return (
    <figcaption className="image-caption">
      {caption && <span>{caption}</span>}
      {credit && <span className="image-credit">{credit}</span>}
    </figcaption>
  );
}
