import Link from 'next/link';
export default function Logo() {
  return (
    <Link href="/" className="block w-[160px] h-[60px] flex items-center justify-center relative">
      <img src="/visconn_transaprent6.png" alt="Visconn Logo" className="w-full h-full object-contain" />
    </Link>
  );
}
