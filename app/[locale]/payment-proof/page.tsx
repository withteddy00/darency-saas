'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Upload, Loader2, Check, AlertCircle, FileText, ArrowLeft } from 'lucide-react'

function PaymentProofContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentRef = searchParams.get('ref') || ''
  
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Type de fichier non autorisé. Utilisez JPEG, PNG ou PDF.')
        return
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Maximum 5MB.')
        return
      }
      
      setFile(selectedFile)
      setError('')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0]
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Type de fichier non autorisé. Utilisez JPEG, PNG ou PDF.')
        return
      }
      
      // Validate file size
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Maximum 5MB.')
        return
      }
      
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('paymentReference', paymentRef)

      const response = await fetch('/api/public/payment-proof', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadSuccess(true)
      } else {
        setError(data.error || 'Erreur lors du téléchargement')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Erreur lors du téléchargement')
    } finally {
      setUploading(false)
    }
  }

  // Success Page
  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary mb-2">Preuve uploadée!</h1>
            <p className="text-text-secondary mb-6">
              Votre preuve de virement a été téléchargée avec succès. Nous allons vérifier votre paiement sous 24-48h.
            </p>
            
            {paymentRef && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-text-secondary">Référence de paiement</p>
                <p className="text-lg font-mono font-semibold text-text-primary">{paymentRef}</p>
              </div>
            )}
            
            <button
              onClick={() => router.push('/fr')}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-center">
            <FileText className="w-12 h-12 text-white mx-auto mb-2" />
            <h1 className="text-xl font-bold text-white">Preuve de virement</h1>
            <p className="text-primary-100 text-sm">
              Téléchargez la preuve de votre virement bancaire
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Payment Reference */}
            {paymentRef && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-700">Référence de paiement</p>
                <p className="text-lg font-mono font-bold text-amber-800">{paymentRef}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : file 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div>
                  <FileText className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="font-medium text-text-primary">{file.name}</p>
                  <p className="text-sm text-text-tertiary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-3 text-sm text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                  <p className="text-text-secondary mb-2">
                    Glissez-déposez votre fichier ici
                  </p>
                  <p className="text-sm text-text-tertiary mb-4">
                    ou cliquez pour sélectionner
                  </p>
                  <label className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors cursor-pointer">
                    Parcourir
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-xs text-text-tertiary mt-4">
                    JPEG, PNG ou PDF • Maximum 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Télécharger la preuve
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function PaymentProofPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentProofContent />
    </Suspense>
  )
}
