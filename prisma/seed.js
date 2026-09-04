// Script de siembra de datos iniciales.
// Correr con: npm run db:seed
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Sembrando datos...");

  // --- Marcas ---
  const newPel = await prisma.marca.upsert({
    where: { nombre: "New Pel" },
    update: { destacada: true },
    create: { nombre: "New Pel", destacada: true },
  });
  const elite = await prisma.marca.upsert({
    where: { nombre: "Elite" },
    update: {},
    create: { nombre: "Elite" },
  });

  // --- Categorías ---
  const catPapel = await prisma.categoria.upsert({
    where: { slug: "papel-higienico" },
    update: {},
    create: { nombre: "Papel Higiénico", slug: "papel-higienico" },
  });
  const catRollos = await prisma.categoria.upsert({
    where: { slug: "rollos-cocina" },
    update: {},
    create: { nombre: "Rollos de Cocina", slug: "rollos-cocina" },
  });
  const catServilletas = await prisma.categoria.upsert({
    where: { slug: "servilletas" },
    update: {},
    create: { nombre: "Servilletas", slug: "servilletas" },
  });
  const catLimpieza = await prisma.categoria.upsert({
    where: { slug: "limpieza-heavy-duty" },
    update: {},
    create: { nombre: "Limpieza Heavy Duty", slug: "limpieza-heavy-duty" },
  });

  // --- Productos de ejemplo ---
  const productos = [
    {
      nombre: "New Pel Rollo de Cocina 100m",
      sku: "NP-ROC-100",
      marcaId: newPel.id,
      categoriaId: catRollos.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 1,
      paquetesPorBulto: 12,
      bultosPorPallet: 40,
      costoUnitario: 900,
      precioPaquete: 1350,
      stockPaquetes: 800,
      minimoCompraPaquetes: 6,
      descuentoBultoPct: 8,
      descuentoPalletPct: 15,
      descripcion: "Rollo de cocina institucional New Pel de 100 metros, alta absorción.",
    },
    {
      nombre: "New Pel Papel Higiénico Institucional x40",
      sku: "NP-PHI-40",
      marcaId: newPel.id,
      categoriaId: catPapel.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 40,
      paquetesPorBulto: 1,
      bultosPorPallet: 60,
      costoUnitario: 8500,
      precioPaquete: 12500,
      stockPaquetes: 150,
      minimoCompraPaquetes: 1,
      descuentoBultoPct: 0,
      descuentoPalletPct: 12,
      descripcion: "Pack institucional de 40 rollos de papel higiénico hoja simple.",
    },
    {
      nombre: "Elite Servilletas Interfoliadas x50",
      sku: "EL-SRV-50",
      marcaId: elite.id,
      categoriaId: catServilletas.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 50,
      paquetesPorBulto: 20,
      bultosPorPallet: 30,
      costoUnitario: 450,
      precioPaquete: 690,
      stockPaquetes: 500,
      minimoCompraPaquetes: 10,
      descuentoBultoPct: 10,
      descuentoPalletPct: 18,
      descripcion: "Servilletas interfoliadas para dispenser, packs de 50 unidades.",
    },
    {
      nombre: "Elite Desengrasante Heavy Duty 5L",
      sku: "EL-DEG-5L",
      marcaId: elite.id,
      categoriaId: catLimpieza.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 1,
      paquetesPorBulto: 4,
      bultosPorPallet: 48,
      costoUnitario: 3200,
      precioPaquete: 4800,
      stockPaquetes: 12,
      minimoCompraPaquetes: 2,
      descuentoBultoPct: 6,
      descuentoPalletPct: 14,
      descripcion: "Desengrasante industrial concentrado, bidón de 5 litros.",
    },
    {
      nombre: "New Pel Rollo de Cocina 200m Doble Hoja",
      sku: "NP-ROC-200",
      marcaId: newPel.id,
      categoriaId: catRollos.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 1,
      paquetesPorBulto: 9,
      bultosPorPallet: 40,
      costoUnitario: 1650,
      precioPaquete: 2390,
      stockPaquetes: 340,
      minimoCompraPaquetes: 6,
      descuentoBultoPct: 8,
      descuentoPalletPct: 16,
      descripcion: "Rollo de cocina doble hoja, mayor absorción, 200 metros.",
    },
    {
      nombre: "New Pel Papel Higiénico Hoja Doble x24",
      sku: "NP-PHD-24",
      marcaId: newPel.id,
      categoriaId: catPapel.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 24,
      paquetesPorBulto: 2,
      bultosPorPallet: 60,
      costoUnitario: 6800,
      precioPaquete: 9900,
      stockPaquetes: 210,
      minimoCompraPaquetes: 1,
      descuentoBultoPct: 5,
      descuentoPalletPct: 12,
      descripcion: "Papel higiénico hoja doble, pack institucional de 24 rollos.",
    },
    {
      nombre: "New Pel Toallas Interfoliadas Z x200",
      sku: "NP-TIZ-200",
      marcaId: newPel.id,
      categoriaId: catServilletas.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 200,
      paquetesPorBulto: 20,
      bultosPorPallet: 32,
      costoUnitario: 1450,
      precioPaquete: 2100,
      stockPaquetes: 380,
      minimoCompraPaquetes: 5,
      descuentoBultoPct: 9,
      descuentoPalletPct: 17,
      descripcion: "Toallas de mano interfoliadas tipo Z, pack de 200 unidades para dispenser.",
    },
    {
      nombre: "Elite Servilletas de Mesa x100",
      sku: "EL-SRM-100",
      marcaId: elite.id,
      categoriaId: catServilletas.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 100,
      paquetesPorBulto: 30,
      bultosPorPallet: 24,
      costoUnitario: 380,
      precioPaquete: 590,
      stockPaquetes: 620,
      minimoCompraPaquetes: 10,
      descuentoBultoPct: 10,
      descuentoPalletPct: 20,
      descripcion: "Servilletas de mesa color blanco, packs de 100 unidades.",
    },
    {
      nombre: "Elite Lavandina Concentrada 5L",
      sku: "EL-LAV-5L",
      marcaId: elite.id,
      categoriaId: catLimpieza.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 1,
      paquetesPorBulto: 4,
      bultosPorPallet: 48,
      costoUnitario: 1200,
      precioPaquete: 1850,
      stockPaquetes: 90,
      minimoCompraPaquetes: 2,
      descuentoBultoPct: 7,
      descuentoPalletPct: 15,
      descripcion: "Lavandina concentrada de uso institucional, bidón de 5 litros.",
    },
    {
      nombre: "Elite Detergente Concentrado 5L",
      sku: "EL-DET-5L",
      marcaId: elite.id,
      categoriaId: catLimpieza.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 1,
      paquetesPorBulto: 4,
      bultosPorPallet: 48,
      costoUnitario: 2100,
      precioPaquete: 3100,
      stockPaquetes: 75,
      minimoCompraPaquetes: 2,
      descuentoBultoPct: 6,
      descuentoPalletPct: 14,
      descripcion: "Detergente concentrado para vajilla, rendimiento industrial, bidón de 5 litros.",
    },
    {
      nombre: "Elite Trapo de Piso Rejilla x5",
      sku: "EL-TRP-5",
      marcaId: elite.id,
      categoriaId: catLimpieza.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 5,
      paquetesPorBulto: 10,
      bultosPorPallet: 36,
      costoUnitario: 1900,
      precioPaquete: 2700,
      stockPaquetes: 140,
      minimoCompraPaquetes: 3,
      descuentoBultoPct: 8,
      descuentoPalletPct: 16,
      descripcion: "Trapos de piso tipo rejilla, alta absorción, pack de 5 unidades.",
    },
    {
      nombre: "New Pel Papel Higiénico Economy x8",
      sku: "NP-PHE-8",
      marcaId: newPel.id,
      categoriaId: catPapel.id,
      presentacion: "PAQUETE",
      unidadesPorPaquete: 8,
      paquetesPorBulto: 6,
      bultosPorPallet: 72,
      costoUnitario: 2100,
      precioPaquete: 3050,
      stockPaquetes: 15,
      minimoCompraPaquetes: 4,
      descuentoBultoPct: 5,
      descuentoPalletPct: 10,
      descripcion: "Línea económica hoja simple, pack hogareño de 8 rollos, ideal reventa.",
    },
  ];

  for (const p of productos) {
    await prisma.producto.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }

  // --- Usuario administrador ---
  const adminEmail = "admin@newpel.com";
  const existente = await prisma.usuario.findUnique({ where: { email: adminEmail } });
  if (!existente) {
    await prisma.usuario.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash("admin123", 10),
        rol: "ADMIN",
        nombreComercio: "Administración",
        cuitODni: "00000000000",
        telefono: "0000000000",
        direccion: "Depósito central",
      },
    });
    console.log("Usuario admin creado -> email: admin@newpel.com / password: admin123");
  }

  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
