import SidebarTree, { TreeNode } from '@/components/sidebar/SidebarTree';

export default function ModelTree({ data = [] }: { data?: TreeNode[] }) {
  return <SidebarTree data={data} />;
}











