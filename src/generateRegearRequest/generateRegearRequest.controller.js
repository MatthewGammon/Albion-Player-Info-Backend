const gear = require('../data/gear.json');
const {
  Regears_Base_Url,
  generateTier,
  getItemName,
} = require('../utils/utils');

const fetch = require('node-fetch');

// I need these objects available globally in order to control the order of my res.locals.regearReq object.
// this is important for when I map it to my model in my Spring Boot application.
let shortenedNames = [];
let itemLevels = {};

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
    shortenedNames.push(shortenedName);
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
  // set properties from original request body
  res.locals.regearReq.characterName = character_name;
  res.locals.regearReq.guildName = guild_name;
  res.locals.regearReq.eventId = event_id;
  res.locals.regearReq.itemPower = item_power;

  // set main_hand properties
  res.locals.regearReq.mainHand = shortenedNames[0];
  res.locals.regearReq.mainTier = itemLevels[main_hand].itemLevel;
  res.locals.regearReq.mainEquivalent = itemLevels[main_hand].tierEquivalent;

  // set head_gear properties
  res.locals.regearReq.headGear = shortenedNames[1];
  res.locals.regearReq.headTier = itemLevels[head_piece].itemLevel;
  res.locals.regearReq.headEquivalent = itemLevels[head_piece].tierEquivalent;

  // set chest_gear properties
  res.locals.regearReq.chestGear = shortenedNames[2];
  res.locals.regearReq.chestTier = itemLevels[chest_armor].itemLevel;
  res.locals.regearReq.chestEquivalent = itemLevels[chest_armor].tierEquivalent;

  // set shoes properties
  res.locals.regearReq.shoes = shortenedNames[3];
  res.locals.regearReq.shoesTier = itemLevels[shoes].itemLevel;
  res.locals.regearReq.shoesEquivalent = itemLevels[shoes].tierEquivalent;

  // set remaining properties from original request body.
  res.locals.regearReq.timeOfDeath = time_of_death;

  shortenedNames = [];
  itemLevels = {};

  next();
}

async function create(req, res, next) {
  const regearRequest = res.locals.regearReq;
  try {
    const response = await fetch('http://localhost:8080/regears/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(regearRequest),
    });
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  create: [
    generateEnglishName,
    generateItemLevels,
    generateNewResponseBody,
    create,
  ],
};
