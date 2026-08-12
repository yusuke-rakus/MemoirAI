import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DISPLAY_NAME_MAX_LENGTH } from "@/constants/userProfile";
import { useLocalUser } from "@/contexts/LocalUserContext";
import { UserProfileClient } from "@/lib/service/userProfileClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSettingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "ユーザー名を入力してください")
    .max(
      DISPLAY_NAME_MAX_LENGTH,
      `ユーザー名は${DISPLAY_NAME_MAX_LENGTH}文字以内で入力してください`,
    ),
});

type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;

type Props = {
  uid?: string;
};

export const ProfileSettingsForm = ({ uid }: Props) => {
  const { localUser, setLocalUser } = useLocalUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      displayName: localUser.displayName ?? "",
    },
  });

  useEffect(() => {
    form.reset({ displayName: localUser.displayName ?? "" });
  }, [form, localUser.displayName]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!uid) return;

    setIsSubmitting(true);
    try {
      await UserProfileClient.updateDisplayName(uid, values.displayName);
      setLocalUser({
        ...localUser,
        displayName: values.displayName,
      });
      form.reset(values);
      toast.success("ユーザー名を更新しました");
    } catch (error) {
      console.error("Failed to update display name", error);
      toast.error("ユーザー名の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ユーザー名</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="name"
                  disabled={isSubmitting || !uid}
                  maxLength={DISPLAY_NAME_MAX_LENGTH}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !uid || !form.formState.isDirty}
          >
            {isSubmitting ? "保存中…" : "保存"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
