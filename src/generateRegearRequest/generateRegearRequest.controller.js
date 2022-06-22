const gear = require('../data/gear.json');
const { generateTier, getItemName } = require('../utils/utils');

// I need these objects available globally in order to control the order of my res.locals.regearReq object.
// this is important for when I map it to my model in my Spring Boot application.
const shortedNames = [];
const itemLevels = {};

function generateEnglishName(req, res, next) {
  const { main_hand, head_piece, chest_armor, shoes } = req.body.data;
  const gearArr = [main_hand, head_piece, chest_armor, shoes];

  const englishNames = [];
  for (const gearPiece of gearArr) {
    const itemDescription = gear.find((item) => item.UniqueName == gearPiece);
    englishNames.push(itemDescription.LocalizedNames['EN-US']);
  }

  for (let fullName of englishNames) {
    const shortenedName = getItemName(fullName);
    shortedNames.push(shortenedName);
  }

  next();
}

function generateItemLevels(req, res, next) {
  const { main_hand, head_piece, chest_armor, shoes } = req.body.data;

  itemLevels[main_hand] = generateTier(main_hand);
  itemLevels[head_piece] = generateTier(head_piece);
  itemLevels[chest_armor] = generateTier(chest_armor);
  itemLevels[shoes] = generateTier(shoes);
  next();
}

function generateNewResponseBody(req, res, next) {
  const {
    main_hand,
    head_piece,
    chest_armor,
    shoes,
    character_name,
    event_id,
    guild_name,
    item_power,
    time_of_death,
  } = req.body.data;

  res.locals.regearReq = {};

  // set main_hand properties
  res.locals.regearReq.main_hand = shortedNames[0];
  res.locals.regearReq.main_tier = itemLevels[main_hand].itemLevel;
  res.locals.regearReq.main_equivalent = itemLevels[main_hand].tierEquivalent;

  // set head_gear properties
  res.locals.regearReq.head_gear = shortedNames[1];
  res.locals.regearReq.head_tier = itemLevels[head_piece].itemLevel;
  res.locals.regearReq.head_equivalent = itemLevels[head_piece].tierEquivalent;

  // set chest_gear properties
  res.locals.regearReq.chest_gear = shortedNames[2];
  res.locals.regearReq.chest_tier = itemLevels[chest_armor].itemLevel;
  res.locals.regearReq.chest_equivalent =
    itemLevels[chest_armor].tierEquivalent;

  // set shoes properties
  res.locals.regearReq.shoes = shortedNames[3];
  res.locals.regearReq.shoes_tier = itemLevels[shoes].itemLevel;
  res.locals.regearReq.shoes_equivalent = itemLevels[shoes].tierEquivalent;

  // set remaining properties from original request body.
  res.locals.regearReq.character_name = character_name;
  res.locals.regearReq.event_id = event_id;
  res.locals.regearReq.guild_name = guild_name;
  res.locals.regearReq.item_power = item_power;
  res.locals.regearReq.time_of_death = time_of_death;

  next();
}

function create(req, res, next) {
  const regearRequest = res.locals.regearReq;
  res.status(201).json({ regearRequest });
}

module.exports = {
  create: [
    generateEnglishName,
    generateItemLevels,
    generateNewResponseBody,
    create,
  ],
};
