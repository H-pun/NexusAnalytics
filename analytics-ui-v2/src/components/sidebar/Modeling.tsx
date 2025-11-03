import LabelTitle from './LabelTitle';
import SidebarTree, { TreeNode } from './SidebarTree';

export default function Modeling() {
  const data: TreeNode[] = [
    { id: 'models', title: 'Models' },
    { id: 'views', title: 'Views' },
  ];
  return (
    <div className="p-2">
      <LabelTitle>Modeling</LabelTitle>
      <SidebarTree data={data} />
    </div>
  );
}











