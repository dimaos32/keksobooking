'use strict';

const MOCKS_QUANTITY = 8;

const PRICE_MIN = 1;
const PRICE_MAX = 50;
const PRICE_STEP = 1000;

const ROOMS_MIN = 1;
const ROOMS_MAX = 4;

const GUESTS_MIN = 2;
const GUESTS_MAX = 10;

const LOCATION_X_MIN = 0;
const LOCATION_Y_MIN = 130;
const LOCATION_Y_MAX = 630;

const PIN_WIDTH = 50;
const PIN_HEIGHT = 70;

const RENT_WORDS_DB = [
  `Сдам`,
  `Сдается`,
  `Свободно жилье -`,
  `Можно арендовать`,
  `Сдается жилье -`,
  `Специально для вас -`,
];

const TYPES_DB = [`palace`, `flat`, `house`, `bungalow`];

const CHECK_IN_OUT_DB = [`12:00`, `13:00`, `14:00`];

const FEATURES_DB = [
  `wifi`,
  `dishwasher`,
  `parking`,
  `washer`,
  `elevator`,
  `conditioner`,
];

const DESCRIPTION_WORDS_DB = [
  `красивые виды из окон.`,
  `тихий район.`,
  `территория Якудзы.`,
  `центр города.`,
  `ярко выраженный местный колорит.`,
];

const PHOTOS_DB = [
  `http://o0.github.io/assets/images/tokyo/hotel1.jpg`,
  `http://o0.github.io/assets/images/tokyo/hotel2.jpg`,
  `http://o0.github.io/assets/images/tokyo/hotel3.jpg`,
];

const typesMap = {
  palace: `Дворец`,
  flat: `Квартира`,
  house: `Дом`,
  bungalow: `Бунгало`,
};

const ofersZone = document.querySelector(`.map__pins`);
const pinTemplate = document.querySelector(`#pin`)
  .content
  .querySelector(`button`);

const fragmentPinList = document.createDocumentFragment();


const cardTemplate = document.querySelector(`#card`)
  .content
  .querySelector(`.popup`);

const fragmentOfferCards = document.createDocumentFragment();

const map = document.querySelector(`.map`);

const getRandomIntNumber = (min = 0, max = 100) => {
  return min + Math.floor(Math.random() * (max - min + 1));
};

const getRandomArrayElements = (arr, n = 1) => {
  let randomArray = [];

  for (let i = 0; i < arr.length && i < n; i++) {
    const element = getRandomIntNumber(i, arr.length - 1);
    randomArray.push(arr[element]);
    const swap = arr[element];
    arr[element] = arr[i];
    arr[i] = swap;
  }

  return randomArray;
};

const getTitle = (type) => {
  return `${RENT_WORDS_DB[getRandomIntNumber(0, RENT_WORDS_DB.length - 1)]} ${typesMap[type]}${(Math.random() < 0.5 ? `!` : `.`)}`;
};

const getDescription = (type, rooms) => {
  return `${typesMap[type]}, кол-во комнат - ${rooms}, ${DESCRIPTION_WORDS_DB[getRandomIntNumber(0, DESCRIPTION_WORDS_DB.length - 1)]}`;
};

const generateMocks = (n) => {
  const generatedMocks = [];

  let avatarNumbers = [];

  for (let i = 1; i <= n; i++) {
    avatarNumbers.push(i < 10 ? `0` + i : i);
  }

  avatarNumbers = getRandomArrayElements(avatarNumbers, n);

  for (let i = 0; i < n; i++) {
    const mock = {
      author: {
        avatar: `img/avatars/user${avatarNumbers[i]}.png`
      },
      offer: {
        title: ``,
        address: ``,
        price: getRandomIntNumber(PRICE_MIN, PRICE_MAX) * PRICE_STEP,
        type: TYPES_DB[getRandomIntNumber(0, TYPES_DB.length - 1)],
        rooms: getRandomIntNumber(ROOMS_MIN, ROOMS_MAX),
        guests: getRandomIntNumber(GUESTS_MIN, GUESTS_MAX),
        checkin: CHECK_IN_OUT_DB[getRandomIntNumber(0, CHECK_IN_OUT_DB.length - 1)],
        checkout: CHECK_IN_OUT_DB[getRandomIntNumber(0, CHECK_IN_OUT_DB.length - 1)],
        features: getRandomArrayElements(FEATURES_DB, getRandomIntNumber(1, FEATURES_DB.length)),
        description: ``,
        photos: getRandomArrayElements(PHOTOS_DB, getRandomIntNumber(1, PHOTOS_DB.length))
      },
      location: {
        x: getRandomIntNumber(LOCATION_X_MIN, ofersZone.offsetWidth),
        y: getRandomIntNumber(LOCATION_Y_MIN, LOCATION_Y_MAX)
      }
    };

    mock.offer.title = getTitle(mock.offer.type);
    mock.offer.address = `${mock.location.x} ${mock.location.y}`;
    mock.offer.description = getDescription(mock.offer.type, mock.offer.rooms);

    generatedMocks.push(mock);
  }

  return generatedMocks;
};

const renderOfferPin = (offer) => {
  const offerPreset = pinTemplate.cloneNode(true);

  offerPreset.style = `left: ${offer.location.x - PIN_WIDTH / 2}px; top: ${offer.location.y - PIN_HEIGHT}px`;
  offerPreset.querySelector(`img`).src = `${offer.author.avatar}`;
  offerPreset.querySelector(`img`).alt = `${offer.offer.title}`;

  return offerPreset;
};

const renderOfferCards = (offer) => {
  const offerPreset = cardTemplate.cloneNode(true);

  offerPreset.querySelector(`.popup__avatar`).src = offer.author.avatar;
  offerPreset.querySelector(`.popup__title`).textContent = offer.offer.title;
  offerPreset.querySelector(`.popup__text--address`).textContent = offer.offer.address;
  offerPreset.querySelector(`.popup__text--price`).innerHTML = `${offer.offer.price}&#x20bd;<span>/ночь</span>`;
  offerPreset.querySelector(`.popup__type`).textContent = typesMap[offer.offer.type];
  offerPreset.querySelector(`.popup__text--capacity`).textContent = `${offer.offer.rooms} комнаты для ${offer.offer.guests} гостей`;
  offerPreset.querySelector(`.popup__text--time`).textContent = `Заезд после ${offer.offer.checkin}, выезд до ${offer.offer.checkout}`;
  offerPreset.querySelector(`.popup__description`).textContent = offer.offer.description;

  for (let i = 0; i < FEATURES_DB.length; i++) {
    if (!offer.offer.features.includes(FEATURES_DB[i])) {
      offerPreset.querySelector(`.popup__feature--${(FEATURES_DB[i])}`).remove();
    }
  }

  for (let i = 0; i < offer.offer.photos.length; i++) {
    offerPreset.querySelectorAll(`.popup__photo`)[i].src = offer.offer.photos[i];

    if (i < offer.offer.photos.length - 1) {
      offerPreset.querySelector(`.popup__photos`)
        .append(offerPreset.querySelector(`.popup__photo`).cloneNode());
    }
  }

  return offerPreset;
};

const offers = generateMocks(MOCKS_QUANTITY);

for (let i = 0; i < offers.length; i++) {
  fragmentPinList.append(renderOfferPin(offers[i]));
}

ofersZone.append(fragmentPinList);

fragmentOfferCards.append(renderOfferCards(offers[0]));

map.insertBefore(fragmentOfferCards, map.querySelector(`.map__filters-container`));

document.querySelector(`.map`).classList.remove(`map--faded`);

