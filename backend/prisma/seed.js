import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Marché Kora database...');

  // ── Catégories ────────────────────────────────────────────────
  const [vetements, accessoires, cosmetiques] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'vetements' },
      update: {},
      create: {
        name: 'Vêtements', slug: 'vetements',
        description: 'Tenues traditionnelles et modernes africaines',
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessoires' },
      update: {},
      create: {
        name: 'Accessoires', slug: 'accessoires',
        description: 'Bijoux, sacs et maroquinerie artisanaux',
        image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cosmetiques' },
      update: {},
      create: {
        name: 'Cosmétiques', slug: 'cosmetiques',
        description: 'Soins naturels et produits de beauté africains',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      },
    }),
  ]);

  // ── Produits ──────────────────────────────────────────────────
  const products = [
    // Vêtements
    {
      categoryId: vetements.id, name: 'Boubou Grand Bazin Royal', slug: 'boubou-grand-bazin-royal',
      description: 'Boubou traditionnel en bazin riche brodé main. Tissu importé du Mali, broderies dorées faites par des artisans béninois. Disponible sur commande en plusieurs coloris.',
      price: 45000, comparePrice: 55000, stock: 15, rating: 4.8, reviewCount: 24, isFeatured: true,
      images: ['https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=600'],
      tags: ['bazin', 'traditionnel', 'cérémonie', 'broderie'],
      variants: { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Blanc cassé', 'Bleu royal', 'Or champagne'] },
    },
    {
      categoryId: vetements.id, name: 'Robe Wax Ankara Premium', slug: 'robe-wax-ankara-premium',
      description: 'Robe longue en tissu wax 100% coton de qualité supérieure. Coupe moderne alliant tradition et élégance contemporaine. Tissu hollandais certifié.',
      price: 22500, comparePrice: 28000, stock: 30, rating: 4.6, reviewCount: 18, isFeatured: true,
      images: ['https://images.unsplash.com/photo-1612085387376-e6ee97eae46b?w=600'],
      tags: ['wax', 'ankara', 'robe', 'coton'],
      variants: { sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Imprimé rouge-or', 'Imprimé bleu-blanc', 'Imprimé vert-noir'] },
    },
    {
      categoryId: vetements.id, name: 'Ensemble Bogolan Homme', slug: 'ensemble-bogolan-homme',
      description: 'Ensemble deux pièces (veste + pantalon) en tissu bogolan authentique du Mali. Chaque pièce est unique, teinte naturellement avec des argiles et plantes locales.',
      price: 38000, stock: 8, rating: 4.9, reviewCount: 11, isFeatured: false,
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'],
      tags: ['bogolan', 'mali', 'artisanal', 'naturel'],
      variants: { sizes: ['M', 'L', 'XL', 'XXL'] },
    },
    {
      categoryId: vetements.id, name: 'Dashiki Brodé Couleurs', slug: 'dashiki-brode-couleurs',
      description: 'Chemise dashiki en coton léger avec broderies multicolores au col et poignets. Parfaite pour un look casual africain chic. Lavage à 30°C conseillé.',
      price: 12500, stock: 45, rating: 4.4, reviewCount: 32,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
      tags: ['dashiki', 'coloré', 'casual', 'coton'],
      variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Bleu-rouge', 'Vert-jaune', 'Orange-blanc'] },
    },
    {
      categoryId: vetements.id, name: 'Pagne Kente Tissé Main', slug: 'pagne-kente-tisse-main',
      description: 'Pagne kente authentique tissé à la main par des artisans ghanéens. Bandes de soie et coton entrelacées selon la tradition ashanti. Longueur 6 yards.',
      price: 65000, stock: 5, rating: 5.0, reviewCount: 7, isFeatured: true,
      images: ['https://images.unsplash.com/photo-1548142813-c348350df52b?w=600'],
      tags: ['kente', 'ghana', 'tissé main', 'soie'],
    },
    // Accessoires
    {
      categoryId: accessoires.id, name: 'Collier Bronze Peul', slug: 'collier-bronze-peul',
      description: 'Collier traditionnel peul en bronze fondu à la cire perdue. Ornementation géométrique typique. Pièce unique fabriquée par un maître forgeron de Ségou.',
      price: 18500, stock: 12, rating: 4.7, reviewCount: 15, isFeatured: true,
      images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600'],
      tags: ['bijou', 'bronze', 'peul', 'artisanal'],
    },
    {
      categoryId: accessoires.id, name: 'Sac Raphia Tressé', slug: 'sac-raphia-tresse',
      description: 'Sac à main en fibre de raphia naturel, tressé à la main par des artisanes béninoises. Doublure en coton teint à l\'indigo. Bandoulière ajustable incluse.',
      price: 15000, comparePrice: 19000, stock: 20, rating: 4.5, reviewCount: 28,
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'],
      tags: ['raphia', 'sac', 'naturel', 'bénin'],
      variants: { colors: ['Naturel', 'Indigo', 'Terre de sienne'] },
    },
    {
      categoryId: accessoires.id, name: 'Bracelet Massaï Perles', slug: 'bracelet-massai-perles',
      description: 'Set de 3 bracelets en perles de verre colorées, style massaï est-africain adapté pour le marché ouest-africain. Tissage serré, très résistant.',
      price: 7500, stock: 50, rating: 4.3, reviewCount: 41,
      images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600'],
      tags: ['bracelet', 'perles', 'coloré', 'set'],
      variants: { colors: ['Rouge-bleu-blanc', 'Vert-jaune-noir', 'Orange-rouge-blanc'] },
    },
    {
      categoryId: accessoires.id, name: 'Ceinture Cuir Bogolan', slug: 'ceinture-cuir-bogolan',
      description: 'Ceinture en cuir véritable tannage végétal, incrustations de tissu bogolan. Boucle en laiton massif. Fabriquée à Bamako, Mali.',
      price: 14000, stock: 18, rating: 4.6, reviewCount: 9,
      images: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600'],
      tags: ['ceinture', 'cuir', 'bogolan', 'laiton'],
      variants: { sizes: ['85cm', '90cm', '95cm', '100cm', '105cm'] },
    },
    // Cosmétiques
    {
      categoryId: cosmetiques.id, name: 'Beurre de Karité Pur Bio', slug: 'beurre-karite-pur-bio',
      description: 'Beurre de karité 100% naturel et non raffiné, origine Burkina Faso. Certifié biologique, riche en vitamines A, E, F. Hydratation intense corps et cheveux. 500g.',
      price: 8500, comparePrice: 10000, stock: 60, rating: 4.9, reviewCount: 87, isFeatured: true,
      images: ['https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600'],
      tags: ['karité', 'bio', 'naturel', 'hydratant'],
    },
    {
      categoryId: cosmetiques.id, name: 'Huile de Coco Vierge Pressée', slug: 'huile-coco-vierge-pressee',
      description: 'Huile de noix de coco vierge extra, première pression à froid. Production artisanale en Côte d\'Ivoire. Multi-usages : cheveux, peau, cuisine. Pot 250ml.',
      price: 6000, stock: 75, rating: 4.7, reviewCount: 63,
      images: ['https://images.unsplash.com/photo-1471943311424-646960669fbc?w=600'],
      tags: ['coco', 'huile', 'naturel', 'multi-usages'],
    },
    {
      categoryId: cosmetiques.id, name: 'Savon Noir Africain Authentique', slug: 'savon-noir-africain',
      description: 'Savon noir africain traditionnel (ose dudu) fait à base de cendres de cacao, d\'huile de palme et de karité. Nettoie, exfolie et unifie le teint. 200g.',
      price: 4500, stock: 90, rating: 4.8, reviewCount: 102, isFeatured: false,
      images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600'],
      tags: ['savon noir', 'exfoliant', 'traditionnel', 'cacao'],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  // ── Utilisateurs test ─────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Kora2024!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@marchekora.com' },
    update: {},
    create: {
      email: 'admin@marchekora.com', passwordHash,
      firstName: 'Administrateur', lastName: 'Marché Kora',
      phone: '+22967000001', role: 'ADMIN',
      cart: { create: {} },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'client@marchekora.com' },
    update: {},
    create: {
      email: 'client@marchekora.com', passwordHash,
      firstName: 'Ama', lastName: 'Diallo',
      phone: '+22967123456', role: 'CUSTOMER',
      cart: { create: {} },
      addresses: {
        create: {
          fullName: 'Ama Diallo', phone: '+22967123456',
          street: '123 Avenue de la République', district: 'Akpakpa',
          city: 'Cotonou', country: 'BJ', isDefault: true,
        },
      },
    },
  });

  console.log(`✅ Seed terminé !`);
  console.log(`   → 3 catégories créées`);
  console.log(`   → ${products.length} produits créés`);
  console.log(`   → Admin : admin@marchekora.com / Kora2024!`);
  console.log(`   → Client : client@marchekora.com / Kora2024!`);
}

main()
  .catch((e) => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
