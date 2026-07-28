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
import type { ContentTask, Post } from "@/types";

import { DeletePostDialog } from "./delete-post-dialog";
import { PostFormDialog } from "./post-form-dialog";
import { PostsEmptyState } from "./posts-empty-state";
import { PostStatusBadge } from "./post-status-badge";

interface PostsListProps {
  contentTaskId: number;
  contentTask: ContentTask;
  posts: Post[];
}

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
];

export function PostsList({ contentTaskId, contentTask, posts }: PostsListProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  if (posts.length === 0) {
    return <PostsEmptyState contentTaskId={contentTaskId} />;
  }

  const query = search.trim().toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const matchesQuery = query
      ? post.title.toLowerCase().includes(query)
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : post.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Posts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"} for{" "}
            {contentTask.title}.
          </p>
        </div>

        <PostFormDialog
          contentTaskId={contentTaskId}
          post={null}
          trigger={<Button type="button">Add Post</Button>}
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
            placeholder="Search posts..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            aria-label="Search posts"
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
      </div>

      {filteredPosts.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No posts match your filters.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Platform</TableHead>
                <TableHead className="hidden lg:table-cell">Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="hidden text-muted-foreground capitalize md:table-cell">
                    {post.platform}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {post.scheduled_date ?? "—"}
                  </TableCell>
                  <TableCell>
                    <PostStatusBadge status={post.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <PostFormDialog
                        contentTaskId={contentTaskId}
                        post={post}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${post.title}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeletePostDialog
                        contentTaskId={contentTaskId}
                        post={post}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${post.title}`}
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
