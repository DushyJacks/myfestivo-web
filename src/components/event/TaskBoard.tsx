"use client"

import { Task, TaskStatus } from "@/lib/events-context"
import Link from "next/link"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { CalendarDays, Clock, CheckSquare, GripVertical, AlertCircle } from "lucide-react"
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"

interface TaskBoardProps {
  tasks: Array<Task & { eventTitle: string; eventId: string }>
  onTasksReorder: (tasks: Array<Task & { eventTitle: string; eventId: string }>, status: TaskStatus) => void
}

const TASK_STATUSES: { status: TaskStatus; label: string; color: string; borderColor: string; accentColor: string }[] = [
  { status: "TODO", label: "To Do", color: "bg-gradient-to-br from-white/[0.02] to-white/[0.005]", borderColor: "border-white/[0.08]", accentColor: "text-white/40" },
  { status: "IN_PROGRESS", label: "In Progress", color: "bg-gradient-to-br from-yellow-500/[0.02] to-yellow-500/[0.005]", borderColor: "border-yellow-500/[0.15]", accentColor: "text-yellow-400/70" },
  { status: "DONE", label: "Done", color: "bg-gradient-to-br from-green-500/[0.02] to-green-500/[0.005]", borderColor: "border-green-500/[0.15]", accentColor: "text-green-400/70" },
]

function DraggableTaskCard({
  task,
  isDragging,
  eventId,
  isOverdue,
}: {
  task: Task & { eventTitle: string; eventId: string }
  isDragging: boolean
  eventId: string
  isOverdue: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging, isOver } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "none",
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isSortableDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={`group perspective ${isSortableDragging ? "z-50 shadow-2xl shadow-white/20" : ""}`}
    >
      <Link href={`/events/${eventId}`}>
        <div
          className={`p-4 rounded-xl cursor-move transition-all duration-300 border backdrop-blur-sm ${
            isSortableDragging
              ? "border-white/30 bg-white/[0.08] shadow-xl shadow-white/20 scale-105"
              : isOverdue
              ? "border-red-500/40 bg-gradient-to-br from-red-500/[0.08] to-red-500/[0.03]"
              : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <motion.div
              {...attributes}
              {...listeners}
              className="flex-shrink-0 pt-0.5 cursor-grab active:cursor-grabbing"
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <GripVertical className="w-4 h-4 text-white/25 hover:text-white/45 transition-colors duration-200" />
            </motion.div>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-2 line-clamp-2 text-white/90 group-hover:text-white transition-colors duration-200">
                {task.title}
              </p>
              {task.description && (
                <p className="text-[10px] text-white/35 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Tags and Metadata */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[9px] font-mono bg-white/[0.04] px-2 py-0.5 rounded text-white/35 group-hover:bg-white/[0.06] transition-all duration-200">
                  {task.eventTitle}
                </span>
                {task.deadline && (
                  <motion.span
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-all duration-200 ${
                      isOverdue
                        ? "bg-red-500/15 text-red-300 group-hover:bg-red-500/25"
                        : "bg-white/[0.04] text-white/35 group-hover:bg-white/[0.06]"
                    }`}
                  >
                    <CalendarDays className="w-3 h-3" />
                    {task.deadline}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Overdue Indicator */}
            {isOverdue && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0 pt-0.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400/70" />
              </motion.div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function TaskColumn({ status, label, color, borderColor, accentColor, tasks, onReorder }: any) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: "Column" },
  })

  const taskIds = tasks.map((t: any) => t.id)

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`rounded-2xl border ${borderColor} ${color} p-6 min-h-[450px] flex flex-col transition-all duration-300 hover:border-white/[0.16] hover:shadow-lg hover:shadow-white/[0.05] backdrop-blur-sm`}
    >
      {/* Column Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-6 pb-5 border-b border-white/[0.08]"
      >
        <div>
          <h3 className={`text-sm font-semibold ${accentColor} tracking-wide transition-colors duration-200`}>
            {label}
          </h3>
          <p className="text-[10px] font-mono text-white/25 mt-1">
            {tasks.length === 1
              ? "1 task"
              : tasks.length === 0
              ? "No tasks"
              : `${tasks.length} tasks`}
          </p>
        </div>
        <motion.div
          className={`px-3 py-1.5 rounded-lg ${color} border ${borderColor} backdrop-blur-sm`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <span className={`text-[12px] font-bold ${accentColor}`}>{tasks.length}</span>
        </motion.div>
      </motion.div>

      {/* Tasks Container */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.length > 0 ? (
              tasks.map((task: any, index: number) => {
                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && status !== "DONE"
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: index * 0.05,
                    }}
                  >
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      isDragging={false}
                      eventId={task.eventId}
                      isOverdue={isOverdue}
                    />
                  </motion.div>
                )
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-white/[0.05]"
              >
                <div className="text-center">
                  <p className="text-[11px] font-mono text-white/15 uppercase tracking-widest">No tasks yet</p>
                  <p className="text-[9px] font-mono text-white/10 mt-1">Drag tasks here</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SortableContext>
      </div>
    </motion.div>
  )
}

export function TaskBoard({ tasks, onTasksReorder }: TaskBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const groupedTasks = {
    TODO: tasks.filter(t => t.status === "TODO"),
    IN_PROGRESS: tasks.filter(t => t.status === "IN_PROGRESS"),
    DONE: tasks.filter(t => t.status === "DONE"),
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over: overData } = event

    if (!overData) return

    const activeTask = tasks.find(t => t.id === active.id)
    const overStatus = overData.id as TaskStatus

    if (!activeTask) return

    // If task moved to a different column, update its status
    if (activeTask.status !== overStatus) {
      // Get the current tasks in the target status
      const tasksInTargetStatus = groupedTasks[overStatus as TaskStatus]
      const updatedTasks = [...tasks]
      const activeIndex = updatedTasks.findIndex(t => t.id === activeTask.id)

      if (activeIndex !== -1) {
        // Update status
        updatedTasks[activeIndex] = { ...activeTask, status: overStatus as TaskStatus }
        onTasksReorder(updatedTasks, overStatus as TaskStatus)
      }
    } else {
      // Reorder within same status - we'll handle this as a visual update
      const statusTasks = groupedTasks[activeTask.status as TaskStatus]
      const oldIndex = statusTasks.findIndex(t => t.id === active.id)
      const newIndex = statusTasks.findIndex(t => t.id === (overData.id as string))

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedStatusTasks = arrayMove(statusTasks, oldIndex, newIndex)
        const allUpdatedTasks = tasks.map(t =>
          reorderedStatusTasks.find(rt => rt.id === t.id) || t
        )
        onTasksReorder(allUpdatedTasks, activeTask.status as TaskStatus)
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {TASK_STATUSES.map(({ status, label, color, borderColor, accentColor }) => (
          <TaskColumn
            key={status}
            status={status}
            label={label}
            color={color}
            borderColor={borderColor}
            accentColor={accentColor}
            tasks={groupedTasks[status]}
            onReorder={onTasksReorder}
          />
        ))}
      </motion.div>
    </DndContext>
  )
}
