import fs from 'fs';
import jwt from 'jsonwebtoken';
import AsyncLock from 'async-lock';
import { InputError, AccessError } from './error';
import { resolve } from 'path';

const lock = new AsyncLock();

const JWT_SECRET = 'giraffegiraffebeetroot';
const DATABASE_FILE = './database.json';

/***************************************************************
                       State Management
***************************************************************/

let users = {};
let listings = {};

const update = (users, listings) =>
  new Promise((resolve, reject) => {
    lock.acquire('saveData', () => {
      try {
        fs.writeFileSync(
          DATABASE_FILE,
          JSON.stringify(
            {
              users,
              listings,
            },
            null,
            2,
          ),
        );
        resolve();
      } catch {
        reject(new Error('Writing to database failed'));
      }
    });
  });

export const save = () => update(users, listings);
export const reset = () => {
  update({}, {}, {});
  users = {};
  listings = {};
};

try {
  const data = JSON.parse(fs.readFileSync(DATABASE_FILE));
  users = data.users;
  listings = data.listings;
} catch {
  console.log('WARNING: No database found, create a new one');
  save();
}

/***************************************************************
                       Helper Functions
***************************************************************/

const newListingId = (_) => generateId(Object.keys(listings));

export const resourceLock = (callback) =>
  new Promise((resolve, reject) => {
    lock.acquire('resourceLock', callback(resolve, reject));
  });

const randNum = (max) => Math.round(Math.random() * (max - Math.floor(max / 10)) + Math.floor(max / 10));
const generateId = (currentList, max = 999999999) => {
  let R = randNum(max);
  while (currentList.includes(R)) {
    R = randNum(max);
  }
  return R.toString();
};

/***************************************************************
                       Auth Functions
***************************************************************/

export const getEmailFromAuthorization = (authorization) => {
  try {
    const token = authorization.replace('Bearer ', '');
    const { email } = jwt.verify(token, JWT_SECRET);
    if (!(email in users)) {
      throw new AccessError('Invalid Token');
    }
    return email;
  } catch {
    throw new AccessError('Invalid Token');
  }
};

export const login = (email, password) =>
  resourceLock((resolve, reject) => {
    const d = new Date();
    const cMonth = d.getMonth() + 1;
    if (email in users) {
      if (users[email].password === password) {
        users[email].sessionActive = true;
        if (cMonth > users[email].currentMonth) {
          listings.map((listing, idx) => {
            listing.monthlyTime = 0;
          })
          users[email].currentMonth = cMonth;
        }
        resolve(jwt.sign({ email }, JWT_SECRET, { algorithm: 'HS256' }));
      }
    }
    reject(new InputError('Invalid username or password'));
  });

export const logout = (email) =>
  resourceLock((resolve, reject) => {
    users[email].sessionActive = false;
    resolve();
  });

export const register = (email, password, name, time, currentMonth) =>
  resourceLock((resolve, reject) => {
    if (email in users) {
      reject(new InputError('Email address already registered'));
    }
    users[email] = {
      name,
      password,
      time,
      currentMonth,
      sessionActive: true,
    };
    const token = jwt.sign({ email }, JWT_SECRET, { algorithm: 'HS256' });
    resolve(token);
  });

/***************************************************************
                       Listing Functions
***************************************************************/

const newListingPayload = (name, leader, patternNumber, monthlyTime, quaterTime, yearlyTime, thumbnail) => ({
  name,
  leader,
  patternNumber,
  monthlyTime,
  quaterTime: [0, 0, 0, 0],
  yearlyTime,
  thumbnail
});

export const listingLength = () => 
  resourceLock((resolve, reject) => {
    resolve(
      Object.keys(listings).length
    );
  })

export const addPilot = (name, email, patternNumber, monthlyTime, quaterTime, yearlyTime, thumbnail) =>
  resourceLock((resolve, reject) => {
    if (name === undefined) {
      reject(new InputError('Must provide a name for new listing'));
    } else if (Object.keys(listings).find((key) => listings[key].name === name) !== undefined) {
      reject(new InputError('A listing with this name already exists'));
    } else if (patternNumber === undefined) {
      reject(new InputError('Must provide an patternNumber for new listing'));
    } else if (monthlyTime === undefined || isNaN(monthlyTime)) {
      reject(new InputError('Must provide a valid monthlyTime for new listing'));
    } else if (thumbnail === undefined) {
      reject(new InputError('Must provide a thumbnail for new listing'));
    } else if (yearlyTime === undefined) {
      reject(new InputError('Must provide yearlyTime details'));
    } else {
      const id = newListingId();
      listings[id] = newListingPayload(name, email, patternNumber, monthlyTime, quaterTime, yearlyTime, thumbnail);
      listings[id].quaterTime[Math.ceil(users[email].currentMonth / 3)] = quaterTime;

      resolve(id);
    }
  });

export const getTimeValue = (email) => 
resourceLock((resolve, reject) => {
  resolve(users[email].time);
});

export const getAllListings = () =>
  resourceLock((resolve, reject) => {
    resolve(
      Object.keys(listings).map((key) => ({
        id: parseInt(key, 10),
        name: listings[key].name,
        leader: listings[key].leader,
        patternNumber: listings[key].patternNumber,
        monthlyTime: listings[key].monthlyTime,
        quaterTime: listings[key].quaterTime,
        yearlyTime: listings[key].yearlyTime,
        thumbnail: listings[key].thumbnail,
      })),
    );
  });

export const assertOwnsListing = (email, listingId) =>
  resourceLock((resolve, reject) => {
    if (!(listingId in listings)) {
      reject(new InputError('Invalid listing ID'));
    } else if (listings[listingId].leader !== email) {
      reject(new InputError('User does not own this Listing'));
    } else {
      resolve();
    }
  });

export const updateIncrementListing = (listingId, time, email) =>
  resourceLock((resolve, reject) => {
    listings[listingId].monthlyTime = parseInt(time) + parseInt(listings[listingId].monthlyTime);
    listings[listingId].quaterTime[Math.ceil(users[email].currentMonth / 3)] = parseInt(time) + parseInt(listings[listingId].quaterTime[Math.ceil(users[email].currentMonth / 3)]);
    listings[listingId].yearlyTime = parseInt(time) + parseInt(listings[listingId].yearlyTime);
    resolve();
  });
  
export const updateDecrementListing = (listingId, time) =>
  resourceLock((resolve, reject) => {
    listings[listingId].monthlyTime = parseInt(listings[listingId].monthlyTime) - parseInt(time);
    listings[listingId].quaterTime[Math.ceil(users[email].currentMonth / 3)] = parseInt(listings[listingId].quaterTime[Math.ceil(users[email].currentMonth / 3)]) - parseInt(time);
    listings[listingId].yearlyTime = parseInt(listings[listingId].yearlyTime) - parseInt(time);
    resolve();
  });

export const removeListing = (listingId) =>
  resourceLock((resolve, reject) => {
    delete listings[listingId];
    resolve();
  });

