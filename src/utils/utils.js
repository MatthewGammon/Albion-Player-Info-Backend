function generateTier(itemSlot) {
  const tier = parseInt(itemSlot.slice(1, 2));
  const enchantment = parseInt(itemSlot.split('@')[1]);

  let tierEquivalent = tier;
  let itemLevel = tier;

  if (!isNaN(enchantment)) {
    tierEquivalent += enchantment;
    itemLevel = `${tier}.${enchantment}`;
  }

  return {
    tierEquivalent,
    itemLevel,
  };
}

function getItemName(itemFullName) {
  const shortenedName = itemFullName.split(' ').slice(1).join(' ');
  return shortenedName;
}

module.exports = {
  generateTier,
  getItemName,
};
