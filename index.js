import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

async function deleteChatCompletely(chatRef) {
  const messagesSnap = await chatRef.collection('messages').get();
  const batch = db.batch();
  messagesSnap.docs.forEach((m) => batch.delete(m.ref));
  batch.delete(chatRef);
  await batch.commit();
}

async function deleteCarCompletely(carRef) {
  const carId = carRef.id;
  const chatsSnap = await db.collection('chats').where('carId', '==', carId).get();
  for (const chat of chatsSnap.docs) await deleteChatCompletely(chat.ref);

  const usersSnap = await db.collection('users').where('savedCars', 'array-contains', carId).get();
  const batch = db.batch();
  usersSnap.docs.forEach((user) => batch.update(user.ref, { savedCars: FieldValue.arrayRemove(carId) }));
  batch.delete(carRef);
  await batch.commit();
}

// Runs once per day. Deletes sold ads after 30 days and inactive accounts after 6 months.
export const dailyCleanup = onSchedule('every 24 hours', async () => {
  const now = Date.now();
  const soldLimit = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const inactiveLimit = new Date(now - 183 * 24 * 60 * 60 * 1000);

  const soldCars = await db.collection('cars')
    .where('status', '==', 'sold')
    .where('soldAt', '<=', soldLimit)
    .limit(50)
    .get();
  for (const car of soldCars.docs) await deleteCarCompletely(car.ref);

  const inactiveUsers = await db.collection('users')
    .where('lastActiveAt', '<=', inactiveLimit)
    .limit(50)
    .get();

  for (const userDoc of inactiveUsers.docs) {
    const uid = userDoc.id;
    const userCars = await db.collection('cars').where('sellerId', '==', uid).limit(50).get();
    for (const car of userCars.docs) await deleteCarCompletely(car.ref);
    await userDoc.ref.delete();
  }
});
