import HeaderBar from '@/components/HeaderBar';
import SiderLayout from '@/components/layouts/SiderLayout';
import HomeSidebar from '@/components/sidebar/home';
import DashboardGrid from '@/components/pages/home/dashboardGrid';

export default function DashboardPage() {
  return (
    <>
      <HeaderBar />
      <SiderLayout sider={<HomeSidebar />}>
        <div className="p-4 space-y-6">
          <DashboardGrid />
        </div>
      </SiderLayout>
    </>
  );
}

