import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="block">
      <div className="relative" style={{ width: '160px', height: '60px' }}>
        <Image src="/visconn_transaprent6.png" alt="Visconn Logo" fill priority loading="eager" sizes="160px" className="object-contain" />
      </div>
    </Link>
  );
}
