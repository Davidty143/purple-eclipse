import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="block">
      <Image src="/visconn_transaprent6.png" alt="Visconn Logo" width={160} height={60} priority loading="eager" className="object-contain" />
    </Link>
  );
}
