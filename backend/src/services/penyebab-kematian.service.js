const prisma = require('../database/connections/prisma_client');

async function getNamaPenyebabById(ids) {
  const penyebabList = ids.length
    ? await prisma.penyebabKematian.findMany({ where: { id: { in: ids } } })
    : [];

  return Object.fromEntries(penyebabList.map((p) => [p.id, p.nama]));
}

module.exports = { getNamaPenyebabById };
