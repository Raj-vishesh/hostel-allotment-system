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
  // NAYA: unmatched students track karne ke liye
  const unmatchedStudents = [];

  while (freeStudents.length > 0) {
    const studentId = freeStudents[0];
    const preferences = studentPreferences[studentId];
    const proposalIndex = nextProposalIndex[studentId];

    if (proposalIndex >= preferences.length) {
      // NAYA: is student ko unmatched list mein daal do
      unmatchedStudents.push(studentId);
      freeStudents = freeStudents.filter((id) => id !== studentId);
      continue;
    }

    const roomId = preferences[proposalIndex];
    const capacity = roomCapacities[roomId];
    const currentStudents = roomAssignments[roomId];

    if (currentStudents.length < capacity) {
      currentStudents.push(studentId);
      freeStudents = freeStudents.filter((id) => id !== studentId);
    } else {
      nextProposalIndex[studentId] = proposalIndex + 1;
    }
  }

  // NAYA: dono cheezein return karo - assignments aur unmatched students
  return { roomAssignments, unmatchedStudents };
}

module.exports = galeShapley;