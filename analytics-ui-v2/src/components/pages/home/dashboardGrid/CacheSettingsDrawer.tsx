"use client";

import { Drawer, Switch, InputNumber, Form } from 'antd';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CacheSettingsDrawer({ open, onClose }: Props) {
  return (
    <Drawer title="Dashboard Cache Settings" open={open} onClose={onClose} width={380} destroyOnClose>
      <Form layout="vertical">
        <Form.Item label="Enable cache">
          <Switch defaultChecked />
        </Form.Item>
        <Form.Item label="TTL (minutes)">
          <InputNumber min={1} defaultValue={60} style={{ width: '100%' }} />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save</Button>
        </div>
      </Form>
    </Drawer>
  );
}










