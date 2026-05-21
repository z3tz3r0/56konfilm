function StandardThumbnail() {
  return (
    <img
      src="/two-column-standard-variant.jpg"
      alt="Standard Variant"
      style={{ position: 'absolute', inset: 0, objectFit: 'contain' }}
    />
  );
}

function EmphasizedThumbnail() {
  return (
    <img
      src="/two-column-emphasized-variant.jpg"
      alt="Emphasized Variant"
      style={{ position: 'absolute', inset: 0, objectFit: 'contain' }}
    />
  );
}

export { StandardThumbnail, EmphasizedThumbnail };
