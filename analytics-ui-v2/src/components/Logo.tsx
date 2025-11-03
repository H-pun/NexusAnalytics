import Image from 'next/image';
interface Props {
  size?: number;
  color?: string;
}

export const Logo = (props: Props) => {
  const { size = 30 } = props;
  return (
    <Image
      src="/images/nexus-analytics-logo.png?v=6"
      alt="Nexus Analytics"
      width={size}
      height={size}
      className="object-contain block"
      priority
    />
  );
};


