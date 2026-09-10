const galeShapley = require('./src/utils/galeShapley');

const studentPreferences = {
  1: [101, 102, 103],
  2: [101, 103, 102],
  3: [102, 101, 103],
};

const roomCapacities = {
  101: 1,
  102: 1,
  103: 1,
};

const result = galeShapley(studentPreferences, roomCapacities);

console.log('Final Room Assignments:');

console.log(galeShapley(studentPreferences, roomCapacities));

console.log('\n--- Test 1: More students than room capacity ---');

const studentPrefs1 = {
  1: [201, 202],
  2: [201, 202],
  3: [201, 202],
};

const roomCap1 = {
  201: 1,
  202: 1,
};
console.log(galeShapley(studentPrefs1, roomCap1));

console.log('\n--- Test 2: Room with capacity > 1 ---');

const studentPrefs2 = {
  1: [301],
  2: [301],
  3: [301],
};

const roomCap2 = {
  301: 2,  // ye room 2 students accommodate kar sakta hai
};

console.log(galeShapley(studentPrefs2, roomCap2));

console.log('\n--- Test 3: More rooms than students ---');

const studentPrefs3 = {
  1: [401, 402],
};

const roomCap3 = {
  401: 1,
  402: 1,
  403: 1,
};

console.log(galeShapley(studentPrefs3, roomCap3));

console.log('\n--- Test 4: All students want the same room first, capacity 1 ---');

const studentPrefs4 = {
  1: [501, 502],
  2: [501, 503],
  3: [501, 504],
};

const roomCap4 = {
  501: 1,
  502: 1,
  503: 1,
  504: 1,
};

console.log(galeShapley(studentPrefs4, roomCap4));