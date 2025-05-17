import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/">
      <div className="h-[60px] w-[160px] flex items-center justify-start">
        <Image src="/visconn_transaprent6.png" alt="Visconn Logo" width={160} height={60} priority loading="eager" className="object-contain" />
      </div>
    </Link>
  );
}
