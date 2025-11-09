export default function LogoBar() {
  return (
    <div
      style={{
        width: '40px',
        height: '40px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="/images/apple-touch-icon.png?v=6"
        alt="NQRust - Analytics"
        style={{
          width: '125%',
          height: '125%',
          display: 'block',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
