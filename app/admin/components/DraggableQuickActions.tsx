'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Users,
  Activity,
  MessageSquare,
  BarChart2,
  Shield,
  CreditCard,
  History,
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  iconName: string;
  href: string;
  color: string;
  badge: string;
}

const iconMap: { [key: string]: any } = {
  Users,
  Activity,
  MessageSquare,
  BarChart2,
  Shield,
  CreditCard,
  History,
};

interface SortableItemProps {
  action: QuickAction;
}

function SortableItem({ action }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.title,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = iconMap[action.iconName] || BarChart2;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <a href={action.href} className="block transition-all duration-300 hover:scale-[1.02]">
        <Card className="group p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab rounded p-1 hover:bg-gray-100 active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </button>
              <div
                className={`rounded-lg p-3 ${action.color} text-white transition-all duration-300 group-hover:rotate-3 group-hover:scale-110`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium text-gray-900 transition-colors duration-200 group-hover:text-gray-700">
                {action.title}
              </h3>
              <p className="truncate text-sm text-gray-500">{action.description}</p>
              <Badge
                variant="outline"
                className="mt-2 text-xs transition-colors duration-200 group-hover:bg-gray-50"
              >
                {action.badge}
              </Badge>
            </div>
          </div>
        </Card>
      </a>
    </div>
  );
}

interface DraggableQuickActionsProps {
  actions: QuickAction[];
}

export function DraggableQuickActions({ actions: initialActions }: DraggableQuickActionsProps) {
  const [actions, setActions] = useState(initialActions);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActions(items => {
        const oldIndex = items.findIndex(item => item.title === active.id);
        const newIndex = items.findIndex(item => item.title === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={actions.map(action => action.title)}
            strategy={verticalListSortingStrategy}
          >
            {actions.map(action => (
              <SortableItem key={action.title} action={action} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
