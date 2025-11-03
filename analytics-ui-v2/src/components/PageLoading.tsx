"use client";

import { Loader2 } from 'lucide-react';

interface Props {
  visible?: boolean;
}

interface LoadingProps {
  children?: React.ReactNode | null;
  spinning?: boolean;
  loading?: boolean;
  tip?: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
}

export const Spinner = ({ className = '', size = 36 }) => (
  <Loader2 className={`animate-spin ${className}`} style={{ width: size, height: size }} />
);

export default function PageLoading(props: Props) {
  const { visible } = props;
  return (
    <div className={`absolute top-12 left-0 right-0 bottom-0 z-[9999] bg-white ${visible ? 'flex' : 'hidden'} items-center justify-center`}>
      <div className="text-center">
        <Spinner />
        <div className="mt-2 text-orange-600">Loading...</div>
      </div>
    </div>
  );
}

export const FlexLoading = (props: { height?: number | string; tip?: string }) => {
  const { height, tip } = props;
  return (
    <div className="flex items-center justify-center flex-col text-orange-600" style={{ height: height || '100%' }}>
      <Spinner />
      {tip && <span className="mt-2">{tip}</span>}
    </div>
  );
};

export const Loading = ({ children = null, spinning = false, loading = false, tip }: LoadingProps) => (
  <div className="relative">
    {(spinning || loading) && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/40">
        <Spinner />
        {tip && <span className="mt-2 ml-2 text-orange-600">{tip}</span>}
      </div>
    )}
    {children}
  </div>
);

export const LoadingWrapper = (props: { loading: boolean; tip?: string; children: React.ReactElement }) => {
  const { loading, tip, children } = props;
  if (loading) return <FlexLoading tip={tip} />;
  return children;
};











