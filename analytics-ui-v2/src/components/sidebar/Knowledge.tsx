import LabelTitle from './LabelTitle';
import SidebarTree, { TreeNode } from './SidebarTree';

export default function Knowledge() {
  const data: TreeNode[] = [
    { id: 'instructions', title: 'Instructions' },
    { id: 'question-sql-pairs', title: 'Question SQL Pairs' },
  ];
  return (
    <div className="p-2">
      <LabelTitle>Knowledge</LabelTitle>
      <SidebarTree data={data} />
    </div>
  );
}











