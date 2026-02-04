"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createMesto, updateMesto, type MestoFormData } from "@/lib/mesto-actions"
import { useTransition } from "react"
import type { Mesto } from "@/generated/prisma"

const formSchema = z.object({
  title: z.string().min(1, "Введите название").max(200),
  content: z.string().min(1, "Введите описание").max(5000),
  isPublic: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface MestoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mesto?: Mesto | null
  onSuccess?: () => void
}

export function MestoDialog({
  open,
  onOpenChange,
  mesto,
  onSuccess,
}: MestoDialogProps) {
  const [pending, startTransition] = useTransition()
  const isEdit = !!mesto

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: mesto?.title ?? "",
      content: mesto?.content ?? mesto?.description ?? "",
      isPublic: mesto ? mesto.visibility === "PUBLIC" : false,
    },
  })

  const resetForm = () => {
    form.reset({
      title: mesto?.title ?? "",
      content: mesto?.content ?? mesto?.description ?? "",
      isPublic: mesto ? mesto.visibility === "PUBLIC" : false,
    })
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm()
    onOpenChange(next)
  }

  const onSubmit = (values: FormValues) => {
    const data: MestoFormData = {
      title: values.title,
      content: values.content,
      isPublic: values.isPublic,
    }
    startTransition(async () => {
      const result = isEdit
        ? await updateMesto(mesto!.id, data)
        : await createMesto(data)
      if (result.error) {
        form.setError("root", { message: result.error })
        return
      }
      handleOpenChange(false)
      onSuccess?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать место" : "Новое место"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <p className="text-sm text-red-600">
              {form.formState.errors.root.message}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Название места"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Описание</Label>
            <Textarea
              id="content"
              {...form.register("content")}
              placeholder="Описание места"
              rows={4}
            />
            {form.formState.errors.content && (
              <p className="text-xs text-red-600">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              {...form.register("isPublic")}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="isPublic" className="font-normal cursor-pointer">
              Публичное (видно всем)
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохранение…" : isEdit ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
