import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/">
      <div className="h-[60px] w-auto flex items-center justify-start py-5">
        <Image
          src="/visconn_transaprent6.png"
          alt="Visconn Logo"
          width={150}
          height={150}
          priority
          className="w-[120px] sm:w-[140px] md:w-[150px] lg:w-[160px] h-auto" // Responsive width classes
        />
      </div>
    </Link>
  );
}
