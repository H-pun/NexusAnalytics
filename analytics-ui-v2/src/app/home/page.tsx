import HeaderBar from '@/components/HeaderBar';
import SiderLayout from '@/components/layouts/SiderLayout';
import HomeSidebar from '@/components/sidebar/home';
import PromptBox from '@/components/pages/home/prompt';
import PromptThread from '@/components/pages/home/promptThread';
import DashboardGrid from '@/components/pages/home/dashboardGrid';
import Preparation from '@/components/pages/home/preparation';

export default function HomeIndexPage() {
  return (
    <>
      <HeaderBar />
      <SiderLayout sider={<HomeSidebar />}>
        <div className="p-4 space-y-6">
          <PromptBox />
          <PromptThread />
          <DashboardGrid />
          <Preparation />
        </div>
      </SiderLayout>
    </>
  );
}

