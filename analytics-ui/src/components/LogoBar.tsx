export default function LogoBar() {
  return (
    <div
      style={{
        width: '125px',
        height: '30px',
        overflow: 'hidden',
      }}
    >
      <img
        src="/images/brand-horizontal-logo-orange.png?v=9"
        alt="NQRust - Analytics"
        style={{
          width: '180px',
          height: '45px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}
