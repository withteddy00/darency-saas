'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Building2, Users, CreditCard, Wrench, BarChart3, MessageSquare, Check, ArrowRight, Star } from 'lucide-react'

const features = [
  {
    icon: Building2,
    title: 'Gestion des Résidences',
    description: 'Gérez plusieurs résidences, leurs bâtiments et appartements depuis une seule plateforme centralisée.'
  },
  {
    icon: Users,
    title: 'Annuaire des Résidents',
    description: 'Gardez une trace complète de tous les résidents, propriétaires et contacts avec leurs informations détaillées.'
  },
  {
    icon: CreditCard,
    title: 'Suivi des Paiements',
    description: '自动化收取租金和管理费用。追踪付款状态并生成财务报告。'
  },
  {
    icon: Wrench,
    title: 'Demandes de Maintenance',
    description: 'Recevez et gérez les demandes de maintenance des résidents avec un système de suivi complet.'
  },
  {
    icon: BarChart3,
    title: 'Rapports & Analytics',
    description: 'Des tableaux de bord détaillés et des rapports pour prendre des décisions éclairées.'
  },
  {
    icon: MessageSquare,
    title: 'Communication',
    description: 'Envoyez des notifications et maintenez le contact avec les résidents facilement.'
  }
]

const plans = [
  {
    name: 'Starter',
    slug: 'starter',
    price: 499,
    yearlyPrice: 4990,
    description: 'Parfait pour les petites résidences',
    features: [
      '1 résidence',
      '1 syndic',
      'Jusqu\'à 50 appartements',
      'Gestion des charges',
      'Suivi des paiements',
      'Support par email'
    ],
    highlighted: false
  },
  {
    name: 'Pro',
    slug: 'pro',
    price: 999,
    yearlyPrice: 9990,
    description: 'Pour les gestionnaires professionnels',
    features: [
      '3 résidences',
      '3 syndics',
      'Jusqu\'à 200 appartements',
      'Rapports avancés',
      'Support prioritaire',
      'API Access',
      'Personnalisation'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price: 2499,
    yearlyPrice: 24990,
    description: 'Solution complète pour les grandes structures',
    features: [
      'Résidences illimitées',
      'Syndics illimités',
      'Appartements illimités',
      'Rapports personnalisés',
      'Support dédié 24/7',
      'API Access complète',
      'Formation incluse',
      'Intégrations sur mesure'
    ],
    highlighted: false
  }
]

const testimonials = [
  {
    name: 'Mohammed Amrani',
    role: 'Syndic Professionnel',
    content: 'Darency a révolutionné la gestion de mes résidences. Fini le chaos des fichiers Excel!',
    rating: 5
  },
  {
    name: 'Fatima Zahra',
    role: 'Propriétaire',
    content: 'Finally, a platform that understands Moroccan property management needs. Highly recommended!',
    rating: 5
  },
  {
    name: 'Youssef Benali',
    role: 'Gestionnaire Immobilier',
    content: 'Excellent rapport qualité-prix. Le support est très réactif et l\'interface est intuitive.',
    rating: 5
  }
]

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">Darency</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-text-secondary hover:text-primary transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-text-secondary hover:text-primary transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-text-secondary hover:text-primary transition-colors">Témoignages</a>
              <Link 
                href="/fr/login" 
                className="px-4 py-2 text-text-secondary hover:text-primary transition-colors"
              >
                Connexion
              </Link>
              <Link 
                href="/fr/login" 
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Essai Gratuit
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              La plateforme N°1 de gestion immobilière au Maroc
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
              Gérez vos résidences en toute simplicité
            </h1>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              Darency est la plateforme de gestion de propriétés la plus complète au Maroc. 
              Synchronisez les paiements, les demandes de maintenance et la communication avec les résidents.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/fr/login" 
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                Commencer gratuitement
              </Link>
              <Link 
                href="/fr/login" 
                className="w-full sm:w-auto px-8 py-4 bg-white border border-border text-text-primary rounded-xl font-semibold hover:bg-surface-elevated transition-all"
              >
                Voir la démo
              </Link>
            </div>
            <p className="mt-6 text-text-tertiary text-sm">
              Pas de carte bancaire requise • Essai gratuit de 14 jours
            </p>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-surface-elevated p-2">
              <div className="bg-surface rounded-xl p-8 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Dashboard Darency</h3>
                  <p className="text-text-secondary">Interface d&apos;administration moderne et intuitive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Résidences gérées' },
              { value: '10,000+', label: 'Appartements' },
              { value: '25,000+', label: 'Résidents satisfaits' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Une solution complète pour la gestion de vos résidences
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-surface rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-surface-elevated px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-text-primary mb-6">
                Pourquoi choisir Darency ?
              </h2>
              <div className="space-y-6">
                {[
                  { title: 'Interface en français et arabe', description: 'Support complet pour les deux langues officielles du Maroc' },
                  { title: 'Adapté au contexte marocain', description: 'Dirhams, formats de dates et spécificités locales' },
                  { title: 'Sécurisé et fiable', description: 'Vos données sont chiffrées et sauvegardées automatiquement' },
                  { title: 'Support réactif', description: 'Notre équipe est disponible pour vous aider' }
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mr-4 mt-1">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">{benefit.title}</h4>
                      <p className="text-text-secondary">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-primary rounded-2xl p-8 text-white">
                <div className="mb-6">
                  <div className="text-sm text-white/70 mb-2">Résidence Al-Manar</div>
                  <div className="text-3xl font-bold">24/28</div>
                  <div className="text-white/70">appartements occupés</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm text-white/70">taux de paiement</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-white/70">demandes resolues</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Des tarifs transparents
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Choisissez le plan qui correspond à vos besoins
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-surface-elevated rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-white shadow-sm text-text-primary' 
                    : 'text-text-secondary'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                  billingCycle === 'yearly' 
                    ? 'bg-white shadow-sm text-text-primary' 
                    : 'text-text-secondary'
                }`}
              >
                Annuel
                <span className="ml-2 text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div 
                key={i}
                className={`relative bg-surface rounded-2xl p-8 border ${
                  plan.highlighted 
                    ? 'border-primary shadow-xl shadow-primary/10' 
                    : 'border-border'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Populaire
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                  <p className="text-text-secondary text-sm">{plan.description}</p>
                </div>
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-text-primary">
                      {billingCycle === 'monthly' ? plan.price : Math.round(plan.yearlyPrice! / 12)}
                    </span>
                    <span className="text-text-secondary ml-2">DH/mois</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-text-tertiary text-sm mt-1">
                      {plan.yearlyPrice} DH facturés annuellement
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center text-text-secondary">
                      <Check className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/fr/login"
                  className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${
                    plan.highlighted
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-surface-elevated text-text-primary hover:bg-border'
                  }`}
                >
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-surface-elevated px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Ce que disent nos clients
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-surface rounded-2xl p-6 border border-border">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-text-secondary mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-primary font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">{testimonial.name}</div>
                    <div className="text-text-tertiary text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-text-primary mb-6">
            Prêt à simplifier la gestion de vos résidences ?
          </h2>
          <p className="text-xl text-text-secondary mb-10">
            Rejoignez des centaines de syndics qui font confiance à Darency
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/fr/login" 
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/25 inline-flex items-center justify-center"
            >
              Essai gratuit de 14 jours
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          <p className="mt-6 text-text-tertiary text-sm">
            Aucune carte bancaire requise • Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-elevated border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-text-primary">Darency</span>
              </div>
              <p className="text-text-secondary text-sm">
                La plateforme de gestion de propriétés la plus complète au Maroc.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Produit</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="#features" className="hover:text-primary">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-primary">Tarifs</a></li>
                <li><a href="#" className="hover:text-primary">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Entreprise</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="#" className="hover:text-primary">À propos</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Légal</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="#" className="hover:text-primary">Confidentialité</a></li>
                <li><a href="#" className="hover:text-primary">Conditions</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-text-tertiary text-sm">
            © 2024 Darency. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
