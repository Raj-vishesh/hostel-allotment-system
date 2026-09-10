function galeShapley(studentPreferences, roomCapacities) {
  const roomAssignments = {};
  for (const roomId in roomCapacities) {
    roomAssignments[roomId] = [];
  }

  const nextProposalIndex = {};
  for (const studentId in studentPreferences) {
    nextProposalIndex[studentId] = 0;
  }

  let freeStudents = Object.keys(studentPreferences);

  // Jab tak koi free student bacha hai, loop chalta rahega
  while (freeStudents.length > 0) {
    // Pehla free student uthao list se
    const studentId = freeStudents[0];
    const preferences = studentPreferences[studentId];
    const proposalIndex = nextProposalIndex[studentId];

    // Agar student apni poori list try kar chuka hai (sab jagah reject hua)
    if (proposalIndex >= preferences.length) {
      // Is student ko "free" list se hata do - koi room nahi mila isko
      freeStudents = freeStudents.filter((id) => id !== studentId);
      continue; // loop ke agle iteration pe jao
    }

    // Student ki agli preference wali room nikaalo
    const roomId = preferences[proposalIndex];

    // Us room ki capacity aur current students check karo
    const capacity = roomCapacities[roomId];
    const currentStudents = roomAssignments[roomId];

    if (currentStudents.length < capacity) {
      // Khali jagah hai - student ko accept karo
      currentStudents.push(studentId);
      // Ye student ab free nahi hai
      freeStudents = freeStudents.filter((id) => id !== studentId);
    } else {
      // Room full hai - reject ho gaya
      // Agli baar ye student apni next preference try karega
      nextProposalIndex[studentId] = proposalIndex + 1;
    }
  }

  return roomAssignments;
}

module.exports = galeShapley;