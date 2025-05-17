import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="block">
      <img
        src="/visconn_transaprent6.png"
        alt="Visconn Logo"
        width={160}
        height={60}
        className="block"
        style={{
          display: 'block',
          width: '160px',
          height: '60px',
          objectFit: 'contain'
        }}
      />
    </Link>
  );
}
