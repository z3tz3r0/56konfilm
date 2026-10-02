/**
 * Renders the Wedding-themed Grid preview for the Studio variant picker.
 */
function GalleryGridThumbnail() {
  return (
    <div data-mode='wedding' className='bg-background text-foreground p-2'>
      <svg
        viewBox='0 0 320 200'
        width='100%'
        height='100%'
        role='img'
        aria-label='Gallery แบบตาราง'
        fill='currentColor'
      >
        <rect x='112' y='12' width='96' height='8' rx='2' />
        <rect x='80' y='28' width='160' height='4' rx='2' opacity='0.5' />
        <g opacity='0.2'>
          <rect x='16' y='48' width='88' height='56' rx='4' />
          <rect x='116' y='48' width='88' height='56' rx='4' />
          <rect x='216' y='48' width='88' height='56' rx='4' />
          <rect x='16' y='116' width='88' height='56' rx='4' />
          <rect x='116' y='116' width='88' height='56' rx='4' />
          <rect x='216' y='116' width='88' height='56' rx='4' />
        </g>
        <rect x='132' y='184' width='56' height='8' rx='2' />
      </svg>
    </div>
  );
}

/**
 * Renders the three-image Collage preview for the Studio variant picker.
 */
function GalleryCollageThumbnail() {
  return (
    <div data-mode='wedding' className='bg-background text-foreground p-2'>
      <svg
        viewBox='0 0 320 240'
        width='100%'
        height='100%'
        role='img'
        aria-label='Gallery แบบคอลลาจ มีภาพสามตำแหน่งและปุ่มใต้หัวข้อ'
        fill='currentColor'
      >
        <rect x='128' y='8' width='176' height='171' opacity='0.08' />
        <rect x='24' y='28' width='112' height='132' opacity='0.3' />
        <rect x='156' y='24' width='112' height='4' rx='2' />
        <rect x='156' y='68' width='64' height='8' rx='2' />
        <rect x='156' y='82' width='72' height='8' rx='2' />
        <rect x='156' y='100' width='64' height='4' rx='2' opacity='0.5' />
        <rect x='156' y='112' width='56' height='10' rx='2' />
        <rect x='244' y='44' width='44' height='64' opacity='0.3' />
        <rect x='156' y='140' width='132' height='78' opacity='0.3' />
      </svg>
    </div>
  );
}

export { GalleryGridThumbnail, GalleryCollageThumbnail };
