import { NextResponse } from 'next/server'
import getCurrentUser from '@/app/_action/getCurrentUser'
import prisma from '@/app/_lib/prisma'

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { name, image } = body

    // ログインユーザーの取得
    const currentUser = await getCurrentUser()

    // ログインしていない場合はエラー
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('認証していません', { status: 401 })
    }

    // ユーザーの編集
    const response = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
        image,
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.log(error)
    return new NextResponse('Error', { status: 500 })
  }
}
