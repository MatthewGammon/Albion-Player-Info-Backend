const service = require('./regears.service');
const gear = require('../data/gear.json');
const validGear = require('../data/validGear.json');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

const validGuilds = ['Tidal', 'Tidal Surge', 'Ripple'];
const minTier = 7;
const minIp = 1300;

const validProperties = [
  'event_id',
  'time_of_death',
  'character_name',
  'guild_name',
  'item_power',
  'main_hand',
  'head_piece',
  'chest_armor',
  'shoes',
];

const armorTypes = ['CLOTH', 'LEATHER', 'PLATE'];

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

function hasData(req, res, next) {
  const { data } = req.body;

  if (!data) {
    next({
      status: 400,
      message: `The request body is missing the 'data' property.`,
    });
  }
  next();
}

function hasValidProperties(req, res, next) {
  const { data } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !validProperties.includes(field)
  );

  if (invalidFields.length) {
    next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(', ')}`,
    });
  }
  next();
}

function hasEventId(req, res, next) {
  const index = validProperties.indexOf('event_id');
  const { event_id } = req.body.data;

  if (event_id === '' || typeof event_id !== 'string') {
    next({
      status: 400,
      message: `${validProperties[index]} must be a non-empty string.`,
    });
  }
  next();
}

async function regearExists(req, res, next) {
  const { event_id } = req.body.data;
  const regear = await service.read(event_id);

  if (regear) {
    next({
      status: 400,
      message: `A regear submission for this death already exists!`,
    });
  } else {
    res.locals.regear = {
      event_id,
      time_of_death: req.body.data.time_of_death,
    };
  }
  next();
}

function validateGuild(req, res, next) {
  const { guild_name } = req.body.data;

  if (!validGuilds.includes(guild_name)) {
    next({
      status: 400,
      message: `The guild ${guild_name} is not approved for regear submissions.`,
    });
  } else {
    res.locals.regear.guild_name = guild_name;
  }
  next();
}

function hasCharacterName(req, res, next) {
  const index = validProperties.indexOf('character_name');
  const { character_name } = req.body.data;

  if (character_name === '' || typeof character_name !== 'string') {
    next({
      status: 400,
      message: `${validProperties[index]} must be a non-empty string.`,
    });
  } else {
    res.locals.regear.character_name = character_name;
  }
  next();
}

function validateIp(req, res, next) {
  const { item_power } = req.body.data;
  const ipAsNum = parseInt(item_power);

  if (ipAsNum < minIp) {
    next({
      status: 400,
      message: `Item power does not meet minimum requirements.`,
    });
  }
  res.locals.regear.item_power = item_power;
  next();
}

function validateWeapon(req, res, next) {
  const { main_hand } = req.body.data;

  if (main_hand === '' || typeof main_hand !== 'string') {
    next({
      status: 400,
      message: `No weapon equipped!`,
    });
  }

  const itemDescription = gear.find((item) => item.UniqueName === main_hand);
  if (!itemDescription) {
    next({
      status: 400,
      message: `${main_hand} is not a valid weapon.`,
    });
  }

  const weaponFullName = itemDescription.LocalizedNames['EN-US'];
  const weaponName = getItemName(weaponFullName);

  if (!validGear.weapons.includes(weaponFullName)) {
    next({
      status: 400,
      message: `${weaponFullName} is not a regearable weapon.`,
    });
  }

  const itemInfo = generateTier(main_hand);

  if (itemInfo.tierEquivalent < minTier) {
    next({
      status: 400,
      message: `${weaponFullName} does not meet minimum tier equivalency. (equal to tier ${itemInfo.tierEquivalent}) `,
    });
  }

  res.locals.regear.main_tier = itemInfo.itemLevel;
  res.locals.regear.main_hand = weaponName;
  next();
}

function validateHeadPiece(req, res, next) {
  const { head_piece } = req.body.data;

  if (head_piece === '' || typeof head_piece !== 'string') {
    next({
      status: 400,
      message: `No head piece equipped!`,
    });
  }

  const itemDescription = gear.find((item) => item.UniqueName === head_piece);
  if (!itemDescription) {
    next({
      status: 400,
      message: `${head_piece} is not a valid item.`,
    });
  }

  const itemFullName = itemDescription.LocalizedNames['EN-US'];
  const itemName = getItemName(itemFullName);

  const findArmorType = armorTypes.find((type) => head_piece.includes(type));
  const armorType = findArmorType.toLowerCase();

  if (
    !armorType ||
    !validGear.armor_type[armorType].head_piece.includes(itemFullName)
  ) {
    next({
      status: 400,
      message: `${itemFullName} is not a regearable item.`,
    });
  }

  const itemInfo = generateTier(head_piece);

  if (itemInfo.tierEquivalent < minTier) {
    next({
      status: 400,
      message: `${itemFullName} does not meet minimum tier equivalency. (equal to tier ${itemInfo.tierEquivalent}) `,
    });
  }

  res.locals.regear.head_tier = itemInfo.itemLevel;
  res.locals.regear.head_piece = itemName;
  next();
}

function validateChestPiece(req, res, next) {
  const { chest_armor } = req.body.data;

  if (chest_armor === '' || typeof chest_armor !== 'string') {
    next({
      status: 400,
      message: `No chest piece equipped!`,
    });
  }

  const itemDescription = gear.find((item) => item.UniqueName === chest_armor);
  if (!itemDescription) {
    next({
      status: 400,
      message: `${chest_armor} is not a valid item.`,
    });
  }

  const itemFullName = itemDescription.LocalizedNames['EN-US'];
  const itemName = getItemName(itemFullName);

  const findArmorType = armorTypes.find((type) => chest_armor.includes(type));
  const armorType = findArmorType.toLowerCase();

  if (
    !armorType ||
    !validGear.armor_type[armorType].chest_armor.includes(itemFullName)
  ) {
    next({
      status: 400,
      message: `${itemFullName} is not a regearable item.`,
    });
  }

  const itemInfo = generateTier(chest_armor);

  if (itemInfo.tierEquivalent < minTier) {
    next({
      status: 400,
      message: `${itemFullName} does not meet minimum tier equivalency. (equal to tier ${itemInfo.tierEquivalent}) `,
    });
  }

  res.locals.regear.chest_tier = itemInfo.itemLevel;
  res.locals.regear.chest_armor = itemName;
  next();
}

function validateShoes(req, res, next) {
  const { shoes } = req.body.data;
  if (shoes === '' || typeof shoes !== 'string') {
    next({
      status: 400,
      message: `No shoes equipped!`,
    });
  }

  const itemDescription = gear.find((item) => item.UniqueName === shoes);
  if (!itemDescription) {
    next({
      status: 400,
      message: `${shoes} is not a valid item.`,
    });
  }
  const itemFullName = itemDescription.LocalizedNames['EN-US'];
  const itemName = getItemName(itemFullName);

  const findArmorType = armorTypes.find((type) => shoes.includes(type));
  const armorType = findArmorType.toLowerCase();

  if (
    !armorType ||
    !validGear.armor_type[armorType].shoes.includes(itemFullName)
  ) {
    next({
      status: 400,
      message: `${itemFullName} is not a regearable item.`,
    });
  }

  const itemInfo = generateTier(shoes);

  if (itemInfo.tierEquivalent < minTier) {
    next({
      status: 400,
      message: `${itemFullName} does not meet minimum tier equivalency. (equal to tier ${itemInfo.tierEquivalent}) `,
    });
  }

  res.locals.regear.shoes_tier = itemInfo.itemLevel;
  res.locals.regear.shoes = itemName;
  next();
}

async function create(req, res, next) {
  const newSubmission = await service.create(res.locals.regear);
  res.status(201).json({ data: newSubmission });
}

async function list(req, res, next) {
  res.json({ data: await service.list() });
}

module.exports = {
  create: [
    hasData,
    hasValidProperties,
    hasEventId,
    asyncErrorBoundary(regearExists),
    validateGuild,
    hasCharacterName,
    validateIp,
    validateWeapon,
    validateHeadPiece,
    validateChestPiece,
    validateShoes,
    asyncErrorBoundary(create),
  ],
  list: [asyncErrorBoundary(list)],
};
