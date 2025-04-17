import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="hover:opacity-80 transition-opacity">
      <div className="h-[60px] w-auto flex items-center justify-start py-5">
        <Image
          src="/images/VISCONN.png"
          alt="Visconn Logo"
          width={150}
          height={150}
          priority // Important for above-the-fold images
        />
      </div>
    </Link>
  );
}
