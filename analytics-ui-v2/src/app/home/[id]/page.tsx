'use client';

import HeaderBar from '@/components/HeaderBar';
import SiderLayout from '@/components/layouts/SiderLayout';
import HomeSidebar from '@/components/sidebar/home';
import PromptBox from '@/components/pages/home/prompt';
import PromptThread from '@/components/pages/home/promptThread';

type Params = { params: { id: string } };

export default function HomeDetailPage({ params }: Params) {
  const threadId = Number(params.id);
  return (
    <>
      <HeaderBar />
      <SiderLayout sider={<HomeSidebar />}>
        <div className="p-4 space-y-6">
          <PromptBox threadId={threadId} />
          <PromptThread threadId={threadId} />
        </div>
      </SiderLayout>
    </>
  );
}

