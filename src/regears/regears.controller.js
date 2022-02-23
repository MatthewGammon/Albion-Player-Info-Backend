const service = require('./regears.service');
const gear = require('../data/gear.json');
const validGear = require('../data/validGear.json');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

const validGuilds = ['Tidal', 'Tidal Surge', 'Ripple'];

const validProperties = [
  'event_id',
  'character_name',
  'guild_name',
  'head_piece',
  'chest_armor',
  'shoes',
  'main_hand',
];

const armorTypes = ['CLOTH', 'LEATHER', 'PLATE'];

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

function validateHeadPiece(req, res, next) {
  const { head_piece } = req.body.data;

  if (head_piece === '' || typeof head_piece !== 'string') {
    next({
      status: 400,
      message: `No head piece equipped!`,
    });
  }

  const gearObject = gear.filter((item) => item.UniqueName === head_piece);
  const gearName = gearObject[0].LocalizedNames['EN-US'];
  const findArmorType = armorTypes.filter((type) => head_piece.includes(type));
  let armorType;

  if (findArmorType.length) {
    armorType = findArmorType[0].toLowerCase();
  } else {
    next({
      status: 400,
      message: `${gearName} is not a regearable item.`,
    });
  }

  if (!validGear.armor_type[armorType].head_piece.includes(gearName)) {
    next({
      status: 400,
      message: `${gearName} is not a regearable item.`,
    });
  }

  const tier = parseInt(head_piece.slice(1, 2));
  const enchantment = parseInt(head_piece.split('@')[1]);
  let tierEquivalent = tier;

  if (!isNaN(enchantment)) {
    tierEquivalent += enchantment;
  }

  if (tierEquivalent < 8) {
    next({
      status: 400,
      message: `${gearName} does not meet minimum tier equivalency. (equal to tier ${tierEquivalent}) `,
    });
  }

  res.locals.regear.head_piece = gearName;
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

  const gearObject = gear.filter((item) => item.UniqueName === chest_armor);
  let gearName;
  if (gearObject.length) {
    gearName = gearObject[0].LocalizedNames['EN-US'];
  } else {
    gearName = chest_armor;
    next({
      status: 400,
      message: `${gearName} is not a valid in game item.`,
    });
  }
  const findArmorType = armorTypes.filter((type) => chest_armor.includes(type));
  let armorType;
  if (findArmorType.length) {
    armorType = findArmorType[0].toLowerCase();
  } else {
    next({
      status: 400,
      message: `${gearName} is not a regearable item.`,
    });
  }

  if (!validGear.armor_type[armorType].chest_armor.includes(gearName)) {
    next({
      status: 400,
      message: `${gearName} is not a regearable item.`,
    });
  }

  const tier = parseInt(chest_armor.slice(1, 2));
  const enchantment = parseInt(chest_armor.split('@')[1]);
  let tierEquivalent = tier;

  if (!isNaN(enchantment)) {
    tierEquivalent += enchantment;
  }

  if (tierEquivalent < 8) {
    next({
      status: 400,
      message: `${gearName} does not meet minimum tier equivalency. (equal to tier ${tierEquivalent}) `,
    });
  }

  res.locals.regear.chest_armor = gearName;
  next();
}

function validateShoes(req, res, next) {
  const { shoes } = req.body.data;
  if (shoes === '' || typeof shoes !== 'string') {
    next({
      status: 400,
      message: `shoes must be a non-empty string`,
    });
  }

  const gearObject = gear.filter((item) => item.UniqueName === shoes);
  const gearName = gearObject[0].LocalizedNames['EN-US'];
  const findArmorType = armorTypes.filter((type) => shoes.includes(type));
  let armorType;
  if (findArmorType.length) {
    armorType = findArmorType[0].toLowerCase();
  } else {
    next({
      status: 400,
      message: `${gearName} is not a regearable item.`,
    });
  }

  if (!validGear.armor_type[armorType].shoes.includes(gearName)) {
    next({
      status: 400,
      message: `${gearName} is not a regearable item.`,
    });
  }

  const tier = parseInt(shoes.slice(1, 2));
  const enchantment = parseInt(shoes.split('@')[1]);
  let tierEquivalent = tier;

  if (!isNaN(enchantment)) {
    tierEquivalent += enchantment;
  }

  if (tierEquivalent < 8) {
    next({
      status: 400,
      message: `${gearName} does not meet minimum tier equivalency. (equal to tier ${tierEquivalent}) `,
    });
  }

  res.locals.regear.shoes = gearName;
  next();
}

function validateWeapon(req, res, next) {
  const { main_hand } = req.body.data;

  if (main_hand === '' || typeof main_hand !== 'string') {
    next({
      status: 400,
      message: `${main_hand} is not a regearable item.`,
    });
  }

  const gearObject = gear.filter((item) => item.UniqueName === main_hand);
  const weaponName = gearObject[0].LocalizedNames['EN-US'];

  if (!validGear.weapons.includes(weaponName)) {
    next({
      status: 400,
      message: `${weaponName} is not a regearable weapon.`,
    });
  }

  const tier = parseInt(main_hand.slice(1, 2));
  const enchantment = parseInt(main_hand.split('@')[1]);
  let tierEquivalent = tier;

  if (!isNaN(enchantment)) {
    tierEquivalent += enchantment;
  }

  if (tierEquivalent < 8) {
    next({
      status: 400,
      message: `${weaponName} does not meet minimum tier equivalency. (equal to tier ${tierEquivalent}) `,
    });
  }

  res.locals.regear.main_hand = weaponName;
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
    validateHeadPiece,
    validateChestPiece,
    validateShoes,
    validateWeapon,
    asyncErrorBoundary(create),
  ],
  list: [asyncErrorBoundary(list)],
};
