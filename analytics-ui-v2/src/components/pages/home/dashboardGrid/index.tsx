"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CacheSettingsDrawer from './CacheSettingsDrawer';

export default function DashboardGrid() {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 md:col-span-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Cache Settings</Button>
        </div>
        <div className="rounded border p-3 min-h-40">Main Dashboard Area</div>
      </div>
      <div className="col-span-12 md:col-span-4">
        <div className="rounded border p-3">Side Widgets</div>
      </div>
      <CacheSettingsDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}



