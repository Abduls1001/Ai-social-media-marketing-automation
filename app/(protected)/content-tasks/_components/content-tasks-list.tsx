"use client";

import * as React from "react";
import { Pencil, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Campaign, ContentTask } from "@/types";

import { ContentTaskFormDialog } from "./content-task-form-dialog";
import { ContentTaskPriorityBadge } from "./content-task-priority-badge";
import { ContentTaskStatusBadge } from "./content-task-status-badge";
import { ContentTasksEmptyState } from "./content-tasks-empty-state";
import { DeleteContentTaskDialog } from "./delete-content-task-dialog";

interface ContentTasksListProps {
  campaignId: number;
  campaign: Campaign;
  contentTasks: ContentTask[];
}

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function ContentTasksList({
  campaignId,
  campaign,
  contentTasks,
}: ContentTasksListProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");

  if (contentTasks.length === 0) {
    return <ContentTasksEmptyState campaignId={campaignId} />;
  }

  const query = search.trim().toLowerCase();
  const filteredContentTasks = contentTasks.filter((task) => {
    const matchesQuery = query
      ? task.title.toLowerCase().includes(query)
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" ? true : task.priority === priorityFilter;

    return matchesQuery && matchesStatus && matchesPriority;
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Content Tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {contentTasks.length}{" "}
            {contentTasks.length === 1 ? "content task" : "content tasks"}{" "}
            for {campaign.campaign_name}.
          </p>
        </div>

        <ContentTaskFormDialog
          campaignId={campaignId}
          contentTask={null}
          trigger={<Button type="button">Add Content Task</Button>}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search content tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            aria-label="Search content tasks"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredContentTasks.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No content tasks match your filters.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Platform</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Due</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContentTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="hidden text-muted-foreground capitalize md:table-cell">
                    {task.platform}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground capitalize lg:table-cell">
                    {task.content_type.replace("_", " ")}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {task.due_date ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ContentTaskPriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    <ContentTaskStatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ContentTaskFormDialog
                        campaignId={campaignId}
                        contentTask={task}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${task.title}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteContentTaskDialog
                        campaignId={campaignId}
                        contentTask={task}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${task.title}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
