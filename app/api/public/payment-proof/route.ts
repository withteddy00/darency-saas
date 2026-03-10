import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// POST - Upload payment proof
export async function POST(request: Request) {
  try {
    // Check content type
    const contentType = request.headers.get('content-type') || ''

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const paymentReference = formData.get('paymentReference') as string

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!paymentReference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, PDF' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum 5MB' },
        { status: 400 }
      )
    }

    // Find subscription request
    const subscriptionRequest = await prisma.subscriptionRequest.findUnique({
      where: { paymentReference }
    })

    if (!subscriptionRequest) {
      return NextResponse.json(
        { error: 'Invalid payment reference' },
        { status: 404 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'payment-proofs')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${paymentReference}-${Date.now()}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Convert File to Buffer and save
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filePath, buffer)

    // Update subscription request with proof URL
    const proofUrl = `/uploads/payment-proofs/${fileName}`
    await prisma.subscriptionRequest.update({
      where: { id: subscriptionRequest.id },
      data: {
        bankTransferProofUrl: proofUrl,
        bankTransferProofName: file.name,
        bankTransferProofMimeType: file.type,
        bankTransferUploadedAt: new Date(),
        status: 'WAITING_PAYMENT' // Update status to show proof uploaded
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment proof uploaded successfully',
      proofUrl
    })
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    )
  }
}
