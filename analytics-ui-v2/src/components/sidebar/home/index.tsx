"use client";

import TreeTitle from './TreeTitle';
import TreeTitleInput from './TreeTitleInput';
import ThreadTree from './ThreadTree';
import { Button } from '@/components/ui/button';
import { Settings, Github, MessageCircle } from 'lucide-react';

type Props = {
  onOpenSettings?: () => void;
};

export default function HomeSidebar(props: Props) {
  const { onOpenSettings } = props;
  return (
    <div className="relative h-full bg-muted/20 text-foreground pb-3 overflow-x-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-2">
        <TreeTitle title="Threads" />
        <TreeTitleInput placeholder="Filter threads" />
        <ThreadTree items={[{ id: 1, title: 'Getting started' }]} />
      </div>

      <div className="border-t px-2 pt-2 space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => onOpenSettings?.()}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
        <a href="https://discord.com/invite/5DvshJqG8Z" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" className="w-full justify-start">
            <MessageCircle className="mr-2 h-4 w-4" /> Discord
          </Button>
        </a>
        <a href="https://github.com/Canner/WrenAI" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" className="w-full justify-start">
            <Github className="mr-2 h-4 w-4" /> GitHub
          </Button>
        </a>
      </div>
    </div>
  );
}


