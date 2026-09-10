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
console.log(result);