import Image from 'next/image';
export default function LogoBar() {
  return (
    <div style={{ width: '125px', height: '30px', overflow: 'hidden' }}>
      <Image
        src="/images/brand-horizontal-logo-orange.png?v=9"
        alt="NQRust - Analytics"
        width={180}
        height={45}
        className="object-contain block"
        priority
      />
    </div>
  );
}


