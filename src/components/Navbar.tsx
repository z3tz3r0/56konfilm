import Link from 'next/link';

const Navbar = () => {
  return (
    <header>
      <nav className="flex justify-between gap-8 py-8">
        <Link href="/about">about</Link>
        <Link href="/portfolio">portfolio</Link>
        <Link href="/services">service</Link>
        <Link href="/contact">contact us</Link>
      </nav>
    </header>
  );
};

export default Navbar;
