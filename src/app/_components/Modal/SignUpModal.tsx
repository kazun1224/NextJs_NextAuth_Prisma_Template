"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useLoginModal, useSignUpModal } from "@/app/_hooks";
import { Modal, Input, Button } from "@/app/_components";
import axios from "axios";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(2, { message: "2文字以上入力する必要があります。" }),
  email: z.string().email({ message: "メールアドレスの形式ではありません。" }),
  password: z.string().min(6, { message: "6文字以上入力する必要があります。" }),
});

export const SignUpModal = () => {
  const router = useRouter();
  const signUpModal = useSignUpModal();
  const loginModal = useLoginModal();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: { name: "", email: "", password: "" },
    resolver: zodResolver(schema),
  });
  // ログインモーダルを開く
  const onToggle = useCallback(() => {
    signUpModal.onClose();
    loginModal.onOpen();
  }, [signUpModal, loginModal]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setLoading(true);
    try {
      // サインアップ
      const res = await axios.post("/api/signup", data);

      if (res.status === 200) {
        toast.success("アカウント作成しました。");
      }

      await signIn("credentials", {
        ...data,
        redirect: false,
      });
      signUpModal.onClose();
      router.refresh();
    } catch (error) {
      toast.error(`エラーが発生しました。${error}`);
    } finally {
      setLoading(false);
    }
  };
  // モーダルの内容
  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Input
        id="name"
        label="名前"
        disabled={loading}
        register={register}
        errors={errors}
        required
      />

      <Input
        id="email"
        label="メールアドレス"
        disabled={loading}
        register={register}
        errors={errors}
        required
      />

      <Input
        id="password"
        label="パスワード"
        type="password"
        disabled={loading}
        register={register}
        errors={errors}
        required
      />
    </div>
  );

  // フッターの内容
  const footerContent = (
    <div className="mt-3 flex flex-col gap-4">
      <hr />
      {/* Googleログイン */}
      <Button
        outline
        label="Googleでログイン"
        icon={FcGoogle}
        onClick={() => signIn("google")}
      />

      {/* ログインリンク */}
      <div className="mt-4 text-center">
        <div
          onClick={onToggle}
          className="cursor-pointer text-sm text-neutral-500 hover:underline"
        >
          ログインする
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={loading}
      isOpen={signUpModal.isOpen}
      title="サインアップ"
      primaryLabel="サインアップ"
      onClose={signUpModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};
