import SidebarTree, { TreeNode } from '@/components/sidebar/SidebarTree';

export default function ViewTree({ data = [] }: { data?: TreeNode[] }) {
  return <SidebarTree data={data} />;
}











