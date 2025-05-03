import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/">
      <div className="h-[60px] w-auto flex items-center justify-start py-5">
        <Image
          src="/visconn_transaprent3.png"
          alt="Visconn Logo"
          width={200}
          height={200}
          priority // Important for above-the-fold images
        />
      </div>
    </Link>
  );
}
