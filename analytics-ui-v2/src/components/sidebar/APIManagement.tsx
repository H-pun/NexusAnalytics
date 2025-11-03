import LabelTitle from './LabelTitle';
import SidebarTree, { TreeNode } from './SidebarTree';

export default function APIManagement() {
  const data: TreeNode[] = [
    { id: 'history', title: 'History' },
  ];
  return (
    <div className="p-2">
      <LabelTitle>API Management</LabelTitle>
      <SidebarTree data={data} />
    </div>
  );
}











