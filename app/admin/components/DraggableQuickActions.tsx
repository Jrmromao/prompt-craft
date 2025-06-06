"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Users, Activity, MessageSquare, BarChart2, Shield, CreditCard, History } from "lucide-react";

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.title });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = iconMap[action.iconName] || BarChart2;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <a
        href={action.href}
        className="block transition-all duration-300 hover:scale-[1.02]"
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </button>
              <div className={`p-3 rounded-lg ${action.color} text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200 text-sm truncate">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500 truncate">{action.description}</p>
              <Badge variant="outline" className="mt-2 text-xs group-hover:bg-gray-50 transition-colors duration-200">
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
      setActions((items) => {
        const oldIndex = items.findIndex((item) => item.title === active.id);
        const newIndex = items.findIndex((item) => item.title === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={actions.map((action) => action.title)}
            strategy={verticalListSortingStrategy}
          >
            {actions.map((action) => (
              <SortableItem key={action.title} action={action} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
} 